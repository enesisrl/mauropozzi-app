import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { addIcons } from 'ionicons';
import { documentTextOutline, downloadOutline, personOutline, calendarOutline } from 'ionicons/icons';
import { NutritionService, NutritionItem } from '../../../../services/nutrition.service';
import { environment } from '../../../../../environments/environment';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-nutrition',
  templateUrl: './nutrition.page.html',
  styleUrls: ['./nutrition.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonCard,
    IonRefresher,
    IonRefresherContent,
    IonHeader,
    IonToolbar,
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
      this.nutritionService.clearCache();
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
  
  trackById(index: number, item: NutritionItem): string {
    return item.id;
  }
  

  async openExternalLink(url: string) {
    await Browser.open({ url: url });
  }

  /**
   * Apre il file della scheda nutrizionale
   */
  openNutritionFile(item: NutritionItem) {
    this.openExternalLink(item.file_scheda);
  }
}