<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="warning">
        <ion-title>Goldback Calculator</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>USD to Goldback</ion-card-title>
          <ion-card-subtitle>Daily Rate: ${{ dailyRate }}</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-item fill="outline" class="ion-margin-bottom">
            <ion-label position="stacked">USD Amount ($)</ion-label>
            <ion-input
              type="number"
              v-model="usdAmount"
              @ionInput="convertToGoldback"
              placeholder="0.00"
            ></ion-input>
          </ion-item>

          <div class="ion-text-center ion-padding">
            <ion-icon name="swap-vertical" size="large"></ion-icon>
          </div>

          <ion-item fill="outline">
            <ion-label position="stacked">Goldback Total (Gb)</ion-label>
            <ion-input
              type="number"
              v-model="gbAmount"
              @ionInput="convertToUSD"
              placeholder="0.00"
            ></ion-input>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <div class="ion-text-center">
        <p style="font-size: 0.8em; color: gray;">
          Market Price Last Sync: 10:00 AM MST
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonItem, IonLabel, IonInput, IonIcon
} from '@ionic/vue';
import { swapVertical } from 'ionicons/icons';

// Data State
const dailyRate = ref(9.21); // Jan 2026 Rate
const usdAmount = ref();
const gbAmount = ref();
const denominations = [50, 25, 10, 5, 1, 0.5]; // Current Goldback bills

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

const calculateBills = (total: number) => {
  let remaining = total;
  const breakdown = [];

  for (const bill of denominations) {
    const count = Math.floor(remaining / bill);
    if (count > 0) {
      breakdown.push({ label: bill, count: count });
      remaining = Number((remaining % bill).toFixed(2));
    }
  }
  return breakdown;
};
</script>

<style scoped>
ion-card {
  margin-top: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
ion-toolbar {
  --background: #d4af37; /* Gold color */
  --color: black;
}
</style>
