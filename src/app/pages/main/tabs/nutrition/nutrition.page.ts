import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonCard,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, downloadOutline, personOutline, calendarOutline } from 'ionicons/icons';
import { NutritionService, NutritionItem } from '../../../../services/nutrition.service';

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
          console.error('Errore nel caricamento delle schede nutrizionali:', error);
          this.hasMoreData = false;
        },
        complete: () => {
          this.isLoading = false;
          this.initialLoad = false;
        }
      });
    } catch (error) {
      console.error('Errore nel caricamento:', error);
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
   * Apre il file della scheda nutrizionale
   */
  openNutritionFile(item: NutritionItem) {
    if (item.file_scheda) {
      this.nutritionService.openNutritionFile(item.file_scheda);
    }
  }

  /**
   * Calcola il periodo di validità della scheda
   */
  getPeriodLabel(dataDal: string, dataAl: string): string {
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      
      try {
        // Se la data è già nel formato DD/MM/YYYY, convertiamola
        let date: Date;
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          date = new Date(dateStr);
        }
        
        return date.toLocaleDateString('it-IT', {
          day: 'numeric',
          month: 'short'
        });
      } catch {
        return dateStr; // Fallback al formato originale se c'è un errore
      }
    };

    const formattedDal = formatDate(dataDal);
    const formattedAl = formatDate(dataAl);

    if (!dataAl) return `Dal ${formattedDal}`;
    if (!dataDal) return `Fino al ${formattedAl}`;
    return `Dal ${formattedDal} al ${formattedAl}`;
  }

  /**
   * TrackBy function per ottimizzare il rendering della lista
   */
  trackById(index: number, item: NutritionItem): string {
    return item.id;
  }
}
