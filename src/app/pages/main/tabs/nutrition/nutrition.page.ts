import { addIcons } from 'ionicons';
import { Browser } from '@capacitor/browser';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { documentTextOutline, downloadOutline, personOutline, calendarOutline } from 'ionicons/icons';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { NutritionService, NutritionItem } from '../../../../services/nutrition.service';
import { 
  IonContent, 
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonCard,
  IonRefresher,
  IonRefresherContent,
  InfiniteScrollCustomEvent,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-nutrition',
  templateUrl: './nutrition.page.html',
  styleUrls: ['./nutrition.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonCard,
    IonContent,
    IonHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonToolbar
  ]
})

export class NutritionPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  nutritionItems: NutritionItem[] = [];
  isLoading: boolean = false;
  initialLoad: boolean = true;
  hasMoreData: boolean = true;
  currentPage: number = 1;
  pageSize: number = 10;
  environment = environment;

  constructor(private nutritionService: NutritionService) {
    addIcons({ documentTextOutline, downloadOutline, personOutline, calendarOutline });
  }

  ngOnInit() {
    this.loadNutritionData();
  }
  
  loadNutritionData(reset: boolean = false) {
    if (reset) {
      this.nutritionItems = [];
      this.currentPage = 1;
      this.hasMoreData = true;
      this.nutritionService.clearNutritionListCache();
    }

    if (this.isLoading || !this.hasMoreData) {
      return;
    }

    this.isLoading = true;

    this.nutritionService.getNutritionList(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.initialLoad = false;

        if (response.success && response.items) {
          if (reset) {
            this.nutritionItems = response.items;
          } else {
            this.nutritionItems = [...this.nutritionItems, ...response.items];
          }

          this.hasMoreData = response.hasMore || false;
        }
      },
      error: (error) => {
        this.hasMoreData = false;
      },
      complete: () => {
        this.isLoading = false;
        this.initialLoad = false;
      }
    });
  }

  onRefresh(event: any) {
    this.loadNutritionData(true);
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
  
  onInfiniteScroll(event: InfiniteScrollCustomEvent) {
    if (this.hasMoreData && !this.isLoading) {
      this.currentPage++;
      this.loadNutritionData();
    }
    
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
  
  
  /* UI
  ------------------------------------------------------------*/

  openNutritionFile(item: NutritionItem) {
    this.openExternalLink(item.file_scheda);
  }

  
  /* Helpers
  ------------------------------------------------------------*/

  trackById(index: number, item: NutritionItem): string {
    return item.id;
  }

  async openExternalLink(url: string) {
    await Browser.open({ url: url });
  }

}