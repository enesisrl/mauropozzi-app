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
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  hasMoreData = true;
  initialLoad = true;
  environment = environment;

  constructor(private nutritionService: NutritionService) {
    addIcons({ documentTextOutline, downloadOutline, personOutline, calendarOutline });
  }

  ngOnInit() {
    this.loadNutritionData();
  }

  /**
   * Carica i dati nutrizionali
   */
  async loadNutritionData(reset: boolean = false) {
    if (reset) {
      this.initialLoad = true;
      this.currentPage = 1;
      this.nutritionItems = [];
      this.hasMoreData = true;
      this.nutritionService.clearCache();
    }

    if (this.isLoading || !this.hasMoreData) {
      return;
    }

    this.isLoading = true;

    try {
      this.nutritionService.getNutritionList(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          if (response.success && response.items) {
            if (this.currentPage === 1) {
              this.nutritionItems = response.items;
            } else {
              this.nutritionItems = [...this.nutritionItems, ...response.items];
            }

            // Controlla se ci sono altri dati
            this.hasMoreData = response.hasMore !== undefined ? response.hasMore : (response.items.length === this.pageSize);
            this.currentPage++;
          } else {
            this.hasMoreData = false;
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
    } catch (error) {
      this.isLoading = false;
      this.initialLoad = false;
    }
  }

  /**
   * Infinite scroll
   */
  async onInfiniteScroll(event: InfiniteScrollCustomEvent) {
    await this.loadNutritionData();
    event.target.complete();

    if (!this.hasMoreData) {
      event.target.disabled = true;
    }
  }

  /**
   * Refresh pull-to-refresh
   */
  async onRefresh(event: any) {
    await this.loadNutritionData(true);
    if (event?.target) {
      event.target.complete();
    }
  }

  /**
   * Apre il file della scheda nutrizionale
   */
  openNutritionFile(item: NutritionItem) {
    if (item.file_scheda) {
      this.nutritionService.openNutritionFile(item.file_scheda);
    }
  }

  /**
   * TrackBy function per ottimizzare il rendering della lista
   */
  trackById(index: number, item: NutritionItem): string {
    return item.id;
  }
}
