<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="ion-text-center">
          <div class="header-content">
            <div class="main-title">Goldback Calculator</div>
            <div class="subtitle">
              <span v-if="!isOffline">
                Live Rate: ${{ dailyRate }} <ion-icon :icon="checkmarkCircle" color="success" style="vertical-align: text-bottom; font-size: 1.1em;"></ion-icon>
              </span>
              <span v-else style="color: var(--ion-color-warning);">
                Offline: Using cached rate <ion-icon :icon="warningOutline" style="vertical-align: text-bottom;"></ion-icon>
              </span>
            </div>
            <div class="last-updated" v-if="lastSyncedDate">Verified: {{ lastSyncedDate }}</div>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="main-viewport-container">
      <!-- Standard Converter -->
      <ion-card class="glassmorphism-card">
        <ion-card-header>
          <ion-card-title>USD to Goldback</ion-card-title>
          <ion-card-subtitle>Daily Rate: ${{ dailyRate }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-item fill="outline" class="ion-margin-bottom">
            <ion-label position="stacked">USD Amount ($)</ion-label>
            <ion-input
              class="usd-value"
              type="number"
              v-model="usdAmount"
              @ionInput="convertToGoldback"
              placeholder="0.00"
            ></ion-input>
          </ion-item>


          <ion-item fill="outline" class="ion-margin-bottom">
            <ion-label position="stacked">Goldback Total (<img src="/goldbackImage.webp" class="gb-symbol-icon" />)</ion-label>
            <ion-input
              class="gb-value"
              type="number"
              v-model="gbAmount"
              @ionInput="convertToUSD"
              placeholder="0.00"
            ></ion-input>
          </ion-item>

          <div class="ion-text-center ion-margin-top" v-if="usdAmount || gbAmount">
            <ion-button class="clear-form-btn" fill="clear" size="small" @click="clearForm">
              <ion-icon slot="start" :icon="trashOutline"></ion-icon>
              Clear Form
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <div v-if="gbAmount" class="ion-margin-top">
        <div class="results-dashboard">
          <div class="total-command-center">
            <div class="total-row">Total Due: <span class="total-value">${{ Number(usdAmount).toFixed(2) }}</span></div>
          </div>
          <div class="values-container">
            <div class="result-item gold-glow">
              <span class="currency-label">Physical Goldbacks</span>
              <div class="gb-value large-gold"><img src="/goldbackImage.webp" class="gb-symbol-icon" />{{ physicalGbTotal.toFixed(2) }}</div>
            </div>
            <div class="plus-sign">+</div>
            <div class="result-item green-glow">
              <span class="currency-label">Cash Remainder</span>
              <div class="usd-value medium-emerald">${{ cashGapUSD }}</div>
            </div>
          </div>
          <div class="breakdown-header">Suggested Payment Breakdown</div>
          <div class="chip-container">
            <ion-chip v-for="item in breakdown" :key="item.label" :style="getBillStyle(item.label)">
              <img src="/goldbackImage.webp" class="gb-symbol-icon" />
              <ion-label><strong>{{ item.count }}</strong> x {{ item.label }}</ion-label>
            </ion-chip>
            <ion-chip v-if="cashGapUSD && parseFloat(cashGapUSD) > 0" class="cash-chip">
              <ion-icon :icon="logoUsd" style="color: white"></ion-icon>
              <ion-label style="color: white"><span class="usd-value">{{ cashGapUSD }}</span> USD</ion-label>
            </ion-chip>
          </div>
        </div>
      </div>

      <div class="ion-text-center">
        <p style="font-size: 0.8em; color: gray;">
          Market Price Last Sync: 10:00 AM MST
        </p>
      </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonItem, IonLabel, IonInput, IonIcon, IonButton, IonChip
} from '@ionic/vue';
import { logoUsd, trashOutline, checkmarkCircle, warningOutline } from 'ionicons/icons';
import { useGoldbackRate } from '../composables/useGoldbackRate'

// Data State
const { dailyRate, lastSyncedDate, isOffline, syncOfficialRate } = useGoldbackRate();

const usdAmount = ref();
const gbAmount = ref();

const denominations = [100, 50, 25, 10, 5, 1, 0.5];

const breakdown = computed(() => {
  if (!gbAmount.value) return [];
  let remaining = parseFloat(gbAmount.value);
  const result = [];
  for (const bill of denominations) {
    const count = Math.floor(remaining / bill);
    if (count > 0) {
      result.push({ label: bill, count });
      remaining = remaining - (count * bill);
      remaining = Number(remaining.toFixed(2));
    }
  }
  return result;
});

const physicalGbTotal = computed(() => {
  if (!breakdown.value.length) return 0;
  // Sum up the breakdown to get the total physical notes value
  const total = breakdown.value.reduce((acc, item) => acc + (item.count * item.label), 0);
  return Number(total.toFixed(2));
});

const cashGapUSD = computed(() => {
  if (!usdAmount.value) return '0.00';
  const totalUSD = parseFloat(usdAmount.value);
  const goldValueInUSD = physicalGbTotal.value * dailyRate.value;
  const gap = totalUSD - goldValueInUSD;
  return gap > 0 ? gap.toFixed(2) : '0.00';
});

const getBillStyle = (denomination: number) => {
  const colors: Record<number, string> = {
    100: '#1A1A1A', // Obsidian
    50: '#D4AF37', // Gold
    25: '#9C27B0', // Purple
    10: '#009688', // Teal
    5: '#F44336',  // Red
    1: '#4CAF50',  // Green
    0.5: '#757575' // Gray
  };
  const style: Record<string, string> = {
    '--background': colors[denomination] || 'var(--ion-color-medium)',
    '--color': 'white',
    'font-weight': '600'
  };
  if (denomination === 100) {
    style['border'] = '1px solid #D4AF37';
  }
  return style;
};

// Math Logic
const convertToGoldback = () => {
  if (usdAmount.value) {
    gbAmount.value = (usdAmount.value / dailyRate.value).toFixed(2);
  } else {
    gbAmount.value = null;
  }
};

const convertToUSD = () => {
  if (gbAmount.value) {
    usdAmount.value = (gbAmount.value * dailyRate.value).toFixed(2);
  } else {
    usdAmount.value = null;
  }
};

const clearForm = () => {
  usdAmount.value = null;
  gbAmount.value = null;
};

onMounted(() => {
  syncOfficialRate();
});
</script>

<style scoped>
ion-card {
  margin-top: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.custom-toolbar {
  --background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
  --border-width: 0;
  border-bottom: 2px solid;
  border-image: linear-gradient(to right, #D4AF37, #F7EF8A) 1;
  box-shadow: 0 1px 10px rgba(212, 175, 55, 0.4);
  backdrop-filter: blur(10px);
  --color: white;
}
.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
}
.main-title {
  font-weight: 700;
  letter-spacing: -0.5px;
  font-size: 1.7rem;
  line-height: 1.2;
  background: linear-gradient(to right, #D4AF37, #F7EF8A);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.subtitle {
  font-size: 0.9rem;
  color: #888;
  font-weight: 400;
  letter-spacing: 0.5px;
}
.last-updated {
  font-size: 0.65rem;
  color: #666;
  margin-top: 2px;
}
.merchant-btn {
  --color: #D4AF37;
  --border-color: #D4AF37;
  --border-radius: 8px;
  font-weight: 600;
  margin-right: 8px;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}
.glassmorphism-card {
  margin-bottom: 12px;
  background: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid;
  border-image: linear-gradient(to bottom right, rgba(212, 175, 55, 0.3), transparent) 1;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.results-dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.values-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 8px;
}
.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
}
.gold-glow {
  background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0) 70%);
}
.green-glow {
  background: radial-gradient(circle, rgba(46, 125, 50, 0.25) 0%, rgba(46, 125, 50, 0) 70%);
}
.currency-label {
  font-size: 0.7rem;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}
.large-gold {
  font-size: 2.5rem;
  font-weight: 700;
  color: #D4AF37;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.large-gold .gb-symbol-icon {
  height: 0.85em;           /* Slightly smaller ratio for large displays */
  vertical-align: -0.05em;  /* Less of a nudge needed at larger scales */
}
.medium-emerald {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2E7D32;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.separator {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
}
.unit {
  font-size: 0.5em;
  margin-left: 2px;
  opacity: 0.8;
}
.breakdown-header {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 16px;
  margin-bottom: 8px;
}
.chip-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.plus-sign {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-medium);
  margin: 0 8px;
}
.total-command-center {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
  border-top: 1px solid rgba(212, 175, 55, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 12px 12px 0 0;
  width: 100%;
  display: flex;
  justify-content: center;
}
.total-row {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-medium);
  letter-spacing: 0.5px;
}
.total-value {
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  color: white;
}
.cash-chip {
  --background: #1B5E20;
  border: 1px solid #2E7D32;
}
.clear-form-btn {
  --color: #DC143C;
  --background-hover: rgba(220, 20, 60, 0.1);
  --background-activated: rgba(220, 20, 60, 0.1);
  text-shadow: 0 0 8px rgba(220, 20, 60, 0.4);
}
.main-viewport-container {
  display: block;
  padding-bottom: 20px;
}
.gb-symbol-icon {
  width: .9em;
  height: .9em;
  vertical-align: middle;
  filter: brightness(0) saturate(100%) invert(84%) sepia(29%) saturate(836%) hue-rotate(3deg) brightness(91%) contrast(89%);
}
</style>
