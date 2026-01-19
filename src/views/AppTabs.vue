<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="calculator" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="merchant" href="/tabs/merchant">
          <ion-icon :icon="cash" />
          <ion-label>Merchant</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue';
import { calculator, cash } from 'ionicons/icons';
</script>

<style scoped>
ion-tab-button {
  --color-selected: #D4AF37;
}
</style>
