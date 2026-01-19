<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="ion-text-center">
          <div class="header-content">
            <div class="main-title">Merchant Register</div>
            <div class="subtitle">{{ currentDate }}</div>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card class="glassmorphism-card">
        <ion-card-header>
          <ion-card-title>Merchant Register</ion-card-title>
          <ion-card-subtitle>Calculate Change in Goldbacks</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-item fill="outline" class="ion-margin-bottom">
            <ion-label position="stacked">Amount Owed ($)</ion-label>
            <ion-input class="usd-value" type="number" v-model="amountOwedUSD" placeholder="0.00"></ion-input>
          </ion-item>

          <ion-item fill="outline" class="ion-margin-bottom">
            <ion-label position="stacked">Amount Tendered (Gb)</ion-label>
            <ion-input class="gb-value" type="number" v-model="amountTenderedGB" placeholder="0.00"></ion-input>
          </ion-item>
                 </ion-card-content>
      </ion-card>

          <div v-if="changeDueGB !== null" class="ion-margin-top" ref="changeResultCard">
            <div v-if="changeDueGB >= 0" class="ion-text-center">
              <div class="results-dashboard">
                <div class="total-command-center">
                  <div class="total-row">Total Change: <span class="total-value">{{ changeDueGB?.toFixed(2) }} Gb</span></div>
                </div>
                <div class="values-container">
                  <div class="result-item gold-glow">
                      <span class="currency-label">Physical Goldbacks</span>
                      <div class="gb-value large-gold">{{ physicalChangeGB.toFixed(2) }}<span class="unit">Gb</span></div>
                  </div>
                  <div v-if="remainingChangeUSD" class="plus-sign">+</div>
                  <div v-if="remainingChangeUSD" class="result-item green-glow">
                    <span class="currency-label">Cash Remainder</span>
                    <div class="usd-value medium-emerald">${{ remainingChangeUSD }}</div>
                  </div>
                </div>
                <div class="breakdown-header">Recommended Change Breakdown</div>
                <div class="breakdown-header" style="margin-top: 0px; margin-bottom: 20px;">(In Goldbacks)</div>
                <div class="chip-container ion-margin-bottom">
                    <ion-chip v-for="bill in changeBreakdown" :key="bill.label" :style="getBillStyle(bill.label)">
                    <ion-icon :icon="cashOutline" style="color: white"></ion-icon>
                    <ion-label style="color: white"><span class="gb-value">{{ bill.count }}</span> x <span class="gb-value">{{ bill.label }}</span></ion-label>
                </ion-chip>
                <ion-chip v-if="remainingChangeUSD && parseFloat(remainingChangeUSD) > 0" class="cash-chip">
                    <ion-icon :icon="logoUsd" style="color: white"></ion-icon>
                    <ion-label style="color: white"><span class="usd-value">${{ remainingChangeUSD }}</span> USD</ion-label>
                </ion-chip>
                </div>
              </div>
              <div class="ion-margin-top">
                <ion-button fill="outline" color="primary" @click="openSettlementModal">
                  <ion-icon slot="start" :icon="receiptOutline"></ion-icon>
                  View Settlement
                </ion-button>
              </div>

            </div>
            <div v-else class="ion-text-center">
              <h3 style="color: var(--ion-color-danger);">Remaining Due: {{ Math.abs(changeDueGB) }} Gb</h3>
            </div>
          </div>


      <ion-modal :is-open="isModalOpen" :breakpoints="[0, 0.9]" :initial-breakpoint="0.9" @didDismiss="isModalOpen = false" class="settlement-modal">
        <ion-content class="settlement-content">
          <div class="settlement-container">
            <h2 class="settlement-header">Settlement Summary</h2>

            <!-- Step 1 -->
            <div class="step-section">
              <div class="step-label">Goldback Conversion Rate</div>
              <div class="math-equation">
                <span class="math-value">${{ Number(amountOwedUSD).toFixed(2) }}</span>
                <span class="math-operator">/</span>
                <span class="math-value rate-highlight">${{ dailyRate }}</span>
                <span class="math-operator">=</span>
                <span class="math-result">{{ totalGbNeeded }} Gb</span>
              </div>
              <div class="step-sublabel">Amount Owed / Rate = Total Gb Needed</div>
            </div>

            <!-- Step 2 -->
            <div class="step-section">
              <div class="step-label">Payment </div>
              <div class="math-equation">
                <span class="math-value">{{ Number(amountTenderedGB).toFixed(2) }} Gb</span>
                <span class="math-operator">-</span>
                <span class="math-value">{{ totalGbNeeded }} Gb</span>
                <span class="math-operator">=</span>
                <span class="math-result final-result">{{ changeDueGB?.toFixed(2) }} Gb</span>
              </div>
              <div class="step-sublabel">Amount Paid  -  Amount Due  =  Change Due</div>
            </div>

            <!-- Step 3 -->
            <div class="step-section">
              <div class="step-label">Change Due</div>
              <div class="results-dashboard">
                <div class="values-container">
                  <div class="result-item gold-glow">
                    <span class="currency-label">Physical Gold</span>
                    <div class="gb-value large-gold">{{ physicalChangeGB.toFixed(2) }}<span class="unit">Gb</span></div>
                  </div>
                  <div v-if="remainingChangeUSD" class="plus-sign">+</div>
                  <div v-if="remainingChangeUSD" class="result-item green-glow">
                    <span class="currency-label">Cash Remainder</span>
                    <div class="usd-value medium-emerald">${{ remainingChangeUSD }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="ion-margin-top">
              <ion-button expand="block" color="primary" fill="outline" @click="isModalOpen = false">Close</ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonItem, IonLabel, IonInput, IonList, IonChip, IonIcon, IonModal,
  createAnimation, toastController
} from '@ionic/vue';
import { cashOutline, copyOutline, receiptOutline, timeOutline, logoUsd } from 'ionicons/icons';
import { Clipboard } from '@capacitor/clipboard';

// Data State
const dailyRate = ref(9.21); // Jan 2026 Rate
const amountOwedUSD = ref();
const amountTenderedGB = ref();
const changeResultCard = ref<HTMLElement | null>(null);
const isModalOpen = ref(false);
const currentDate = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

const denominations = [100, 50, 25, 10, 5, 1, 0.5]; // Current Goldback bills

const changeDueGB = computed(() => {
  const owed = amountOwedUSD.value;
  const tendered = amountTenderedGB.value;
  if (owed !== '' && owed !== null && owed !== undefined && tendered !== '' && tendered !== null && tendered !== undefined) {
    const owedInGB = Number(owed) / dailyRate.value;
    const change = Number(tendered) - owedInGB;
    return Number(change.toFixed(2));
  }
  return null;
});

const physicalChangeGB = computed(() => {
  if (!changeBreakdown.value) return 0;
  const total = changeBreakdown.value.reduce((acc, item) => acc + (item.count * item.label), 0);
  return Number(total.toFixed(2));
});

const totalGbNeeded = computed(() => {
  if (amountOwedUSD.value && dailyRate.value) {
    return (amountOwedUSD.value / dailyRate.value).toFixed(2);
  }
  return '0.00';
});

const billCalculation = computed(() => {
  if (changeDueGB.value !== null && changeDueGB.value >= 0) {
    return calculateBills(changeDueGB.value);
  }
  return { breakdown: [], remaining: 0 };
});

const changeBreakdown = computed(() => billCalculation.value.breakdown);

const remainingChangeUSD = computed(() => {
  if (billCalculation.value.remaining > 0) {
    return (billCalculation.value.remaining * dailyRate.value).toFixed(2);
  }
  return null;
});

const calculateBills = (total: number) => {
  let remaining = total;
  const breakdown = [];

  for (const bill of denominations) {
    const count = Math.floor(remaining / bill);
    if (count > 0) {
      breakdown.push({ label: bill, count: count });
      remaining = remaining - (count * bill);
      remaining = Number(remaining.toFixed(2));
    }
  }
  return { breakdown, remaining };
};

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
    '--color': 'white'
  };
  if (denomination === 100) {
    style['border'] = '1px solid #D4AF37';
  }
  return style;
};

const playEntranceAnimation = async () => {
  if (changeResultCard.value) {
    const animation = createAnimation()
      .addElement(changeResultCard.value)
      .duration(200)
      .fromTo('transform', 'scale(0.95)', 'scale(1)')
      .fromTo('opacity', '0', '1');
    await animation.play();
  }
};

const openSettlementModal = () => {
  isModalOpen.value = true;
};

const copyReceipt = async () => {
  const date = new Date().toLocaleString();
  let receiptText = `Goldback Transaction Receipt\n`;
  receiptText += `Date: ${date}\n`;
  receiptText += `Rate: $${dailyRate.value}/Gb\n`;
  receiptText += `------------------------\n`;
  receiptText += `Amount Owed: $${Number(amountOwedUSD.value).toFixed(2)}\n`;
  receiptText += `Tendered: ${amountTenderedGB.value} Gb\n`;
  receiptText += `Change Due: ${changeDueGB.value} Gb\n`;

  if (changeBreakdown.value.length > 0) {
    receiptText += `\nBill Breakdown:\n`;
    changeBreakdown.value.forEach(bill => {
      receiptText += `- ${bill.count} x ${bill.label} Gb\n`;
    });
  }

  if (remainingChangeUSD.value) {
    receiptText += `\nRemaining USD Change: $${remainingChangeUSD.value}\n`;
  }

  receiptText += `------------------------\n`;
  receiptText += `Calculated via Goldback Converter`;

  await Clipboard.write({
    string: receiptText
  });

  const toast = await toastController.create({
    message: 'Receipt Copied to Clipboard',
    duration: 2000,
    position: 'bottom',
    color: 'success'
  });

  await toast.present();
};

watch(changeDueGB, (newValue) => {
  if (newValue !== null) {
    nextTick(() => {
      playEntranceAnimation();
    });
  }
});
</script>

<style scoped>ion-card {
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
.glassmorphism-card {
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
.separator {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
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
.medium-emerald {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2E7D32;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.unit {
  font-size: 0.5em;
  margin-left: 2px;
  opacity: 0.8;
}

/* Settlement Modal Styles */
.settlement-modal {
  --background: rgba(20, 20, 20, 0.95);
  --border-radius: 20px 20px 0 0;
}
.settlement-content {
  --background: transparent;
  --color: white;
}
.settlement-container {
  padding: 24px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.03);
}
.settlement-header {
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: #D4AF37;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 1.2rem;
}
.step-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.step-section:last-child {
  border-bottom: none;
}
.step-label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.step-sublabel {
  font-size: 0.7rem;
  color: #666;
  margin-top: 4px;
  text-align: center;
}
.math-equation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', monospace;
  font-size: 1.1rem;
  flex-wrap: wrap;
  max-width: 400px;
  margin: 0 auto;
}
.math-value {
  color: white;
  font-weight: 600;
  min-width: 70px;
  text-align: center;
}
.rate-highlight {
  background: rgba(212, 175, 55, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}
.math-operator {
  color: var(--ion-color-medium);
  font-weight: bold;
}
.math-result {
  color: #4CAF50;
  font-weight: 800;
  min-width: 70px;
  text-align: center;
}
.final-result {
  font-size: 1.2em;
  font-weight: 900;
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
</style>
