<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="warning">
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Merchant Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Merchant Register</ion-card-title>
          <ion-card-subtitle>Calculate Change in Goldbacks</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-item fill="outline" class="ion-margin-bottom">
            <ion-label position="stacked">Amount Owed ($)</ion-label>
            <ion-input type="number" v-model="amountOwedUSD" @ionInput="calculateChange" placeholder="0.00"></ion-input>
          </ion-item>

          <ion-item fill="outline" class="ion-margin-bottom">
            <ion-label position="stacked">Amount Tendered (Gb)</ion-label>
            <ion-input type="number" v-model="amountTenderedGB" @ionInput="calculateChange" placeholder="0.00"></ion-input>
          </ion-item>

          <div v-if="changeDueGB !== null && amountOwedUSD && amountTenderedGB" class="ion-padding-top">
            <div v-if="changeDueGB >= 0" class="ion-text-center">
              <h2>Change Due: {{ changeDueGB }} Gb</h2>
              <ion-list lines="none">
                <ion-item v-for="bill in changeBreakdown" :key="bill.label">
                  <ion-label>{{ bill.count }} x {{ bill.label }} Gb</ion-label>
                </ion-item>
                <ion-item v-if="remainingChangeUSD">
                  <ion-label color="medium">Remaining Change in USD: ${{ remainingChangeUSD }}</ion-label>
                </ion-item>
              </ion-list>
            </div>
            <div v-else class="ion-text-center">
              <h3 style="color: var(--ion-color-danger);">Remaining Due: {{ Math.abs(changeDueGB) }} Gb</h3>
            </div>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonItem, IonLabel, IonInput, IonList
} from '@ionic/vue';

// Data State
const dailyRate = ref(9.21); // Jan 2026 Rate
const amountOwedUSD = ref();
const amountTenderedGB = ref();
const changeDueGB = ref<number | null>(null);
const changeBreakdown = ref<{label: number, count: number}[]>([]);
const remainingChangeUSD = ref<string | null>(null);

const denominations = [50, 25, 10, 5, 1, 0.5]; // Current Goldback bills

const calculateChange = () => {
  if (amountOwedUSD.value && amountTenderedGB.value) {
    const owedInGB = amountOwedUSD.value / dailyRate.value;
    const change = amountTenderedGB.value - owedInGB;
    changeDueGB.value = Number(change.toFixed(2));

    if (changeDueGB.value >= 0) {
      const { breakdown, remaining } = calculateBills(changeDueGB.value);
      changeBreakdown.value = breakdown;

      if (remaining > 0) {
        remainingChangeUSD.value = (remaining * dailyRate.value).toFixed(2);
      } else {
        remainingChangeUSD.value = null;
      }
    } else {
      changeBreakdown.value = [];
      remainingChangeUSD.value = null;
    }
  } else {
    changeDueGB.value = null;
    changeBreakdown.value = [];
    remainingChangeUSD.value = null;
  }
};

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
