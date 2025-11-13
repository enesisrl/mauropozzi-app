import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { WorkoutService, WorkoutExercise } from '../../services/workout.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner
} from '@ionic/angular/standalone';

interface MediaItem {
  type: 'video' | 'photo';
  url: string;
  alt?: string;
}

@Component({
  selector: 'app-workout-exercise-explanation',
  templateUrl: './workout-exercise-explanation.page.html',
  styleUrls: ['./workout-exercise-explanation.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSpinner
  ]
})
export class WorkoutExerciseExplanationPage implements OnInit {
  
  @ViewChild('mediaCarousel') mediaCarousel!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  workoutId: string = '';
  exerciseId: string = '';
  exercise: WorkoutExercise | null = null;
  isLoading: boolean = true;
  
  // Media management
  mediaItems: MediaItem[] = [];
  currentMediaIndex: number = 0;
  totalMediaItems: number = 0;
  
  // Text management
  isTextExpanded: boolean = false;
  hasLongText: boolean = false;
  
  // Touch/drag handling
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private currentTranslateX = 0;
  private dragThreshold = 50; // pixel threshold per cambio slide

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private workoutService: WorkoutService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.workoutId = params['workoutId'];
      this.exerciseId = params['exerciseId'];
      this.loadExerciseData();
    });
  }

  /**
   * Carica i dati dell'esercizio dalla cache
   */
  loadExerciseData() {
    this.isLoading = true;

    // Ottieni l'esercizio dalla cache del workout service
    this.exercise = this.workoutService.getCachedExerciseById(this.workoutId, this.exerciseId);
    
    if (this.exercise) {
      this.setupMediaItems();
      this.checkTextLength();
      this.isLoading = false;
    } else {
      // Se non è in cache, ricarica il workout
      this.workoutService.getWorkoutDetails(this.workoutId).subscribe({
        next: (response) => {
          if (response.success) {
            this.exercise = this.workoutService.getCachedExerciseById(this.workoutId, this.exerciseId);
            if (this.exercise) {
              this.setupMediaItems();
              this.checkTextLength();
            }
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Errore nel caricamento dell\'esercizio:', error);
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Configura gli elementi media (video + foto)
   */
  setupMediaItems() {
    this.mediaItems = [];

    if (!this.exercise) return;

    // Aggiungi video se presente
    if (this.exercise.video) {
      this.mediaItems.push({
        type: 'video',
        url: this.exercise.video
      });
    }

    // Aggiungi foto se presenti
    if (this.exercise.images && this.exercise.images.length > 0) {
      this.exercise.images.forEach((imageUrl: string) => {
        this.mediaItems.push({
          type: 'photo',
          url: imageUrl,
          alt: this.exercise!.descrizione
        });
      });
    }

    this.totalMediaItems = this.mediaItems.length;
  }

  /**
   * Controlla se il testo è lungo e necessita del "read more"
   */
  checkTextLength() {
    if (!this.exercise || !this.exercise.testo) {
      this.hasLongText = false;
      return;
    }

    // Considera "lungo" un testo con più di 150 caratteri
    this.hasLongText = this.exercise.testo.length > 150;
  }

  /**
   * Toggle espansione del testo
   */
  toggleText() {
    this.isTextExpanded = !this.isTextExpanded;
  }

  /**
   * Vai a uno specifico slide media
   */
  goToMediaSlide(index: number) {
    if (index >= 0 && index < this.totalMediaItems) {
      this.currentMediaIndex = index;

      // Pausa video se passiamo a un'altra slide
      if (this.videoElement?.nativeElement && index !== 0) {
        this.videoElement.nativeElement.pause();
      }
    }
  }

  /**
   * Slide precedente
   */
  prevMediaSlide() {
    if (this.currentMediaIndex > 0) {
      this.goToMediaSlide(this.currentMediaIndex - 1);
    }
  }

  /**
   * Slide successiva
   */
  nextMediaSlide() {
    if (this.currentMediaIndex < this.totalMediaItems - 1) {
      this.goToMediaSlide(this.currentMediaIndex + 1);
    }
  }

  // Touch Events
  onTouchStart(event: TouchEvent) {
    if (this.totalMediaItems <= 1) return;
    
    this.isDragging = true;
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.currentTranslateX = -this.currentMediaIndex * 100;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging || this.totalMediaItems <= 1) return;

    event.preventDefault();
    
    const currentX = event.touches[0].clientX;
    const diffX = currentX - this.startX;
    const diffY = Math.abs(event.touches[0].clientY - this.startY);
    
    // Se il movimento è più verticale che orizzontale, ignora
    if (diffY > Math.abs(diffX)) {
      return;
    }

    const dragPercentage = (diffX / window.innerWidth) * 100;
    const newTranslateX = this.currentTranslateX + dragPercentage;
    
    // Applica resistenza ai bordi
    const finalTranslateX = this.applyDragResistance(newTranslateX);
    
    const container = this.mediaCarousel.nativeElement.querySelector('.media-slides-container') as HTMLElement;
    if (container) {
      container.style.transform = `translateX(${finalTranslateX}%)`;
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging || this.totalMediaItems <= 1) return;

    this.isDragging = false;
    
    const endX = event.changedTouches[0].clientX;
    const diffX = endX - this.startX;

    // Determina la direzione dello swipe
    if (Math.abs(diffX) > this.dragThreshold) {
      if (diffX > 0) {
        this.prevMediaSlide();
      } else {
        this.nextMediaSlide();
      }
    } else {
      // Ripristina la posizione originale
      this.goToMediaSlide(this.currentMediaIndex);
    }
  }

  // Mouse Events (per desktop)
  onMouseDown(event: MouseEvent) {
    if (this.totalMediaItems <= 1) return;
    
    this.isDragging = true;
    this.startX = event.clientX;
    this.currentTranslateX = -this.currentMediaIndex * 100;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging || this.totalMediaItems <= 1) return;

    event.preventDefault();
    
    const diffX = event.clientX - this.startX;
    const dragPercentage = (diffX / window.innerWidth) * 100;
    const newTranslateX = this.currentTranslateX + dragPercentage;
    
    const finalTranslateX = this.applyDragResistance(newTranslateX);
    
    const container = this.mediaCarousel.nativeElement.querySelector('.media-slides-container') as HTMLElement;
    if (container) {
      container.style.transform = `translateX(${finalTranslateX}%)`;
    }
  }

  onMouseUp(event: MouseEvent) {
    if (!this.isDragging || this.totalMediaItems <= 1) return;

    this.isDragging = false;
    
    const diffX = event.clientX - this.startX;

    if (Math.abs(diffX) > this.dragThreshold) {
      if (diffX > 0) {
        this.prevMediaSlide();
      } else {
        this.nextMediaSlide();
      }
    } else {
      this.goToMediaSlide(this.currentMediaIndex);
    }
  }

  /**
   * Applica resistenza al drag ai bordi
   */
  private applyDragResistance(translateX: number): number {
    const maxTranslateX = 0;
    const minTranslateX = -(this.totalMediaItems - 1) * 100;
    
    if (translateX > maxTranslateX) {
      // Resistenza a sinistra
      const overflow = translateX - maxTranslateX;
      return maxTranslateX + (overflow * 0.3);
    } else if (translateX < minTranslateX) {
      // Resistenza a destra
      const overflow = minTranslateX - translateX;
      return minTranslateX - (overflow * 0.3);
    }
    
    return translateX;
  }

  /**
   * Torna indietro alla pagina precedente
   */
  goBack() {
    console.log('GoBack - Current exercise being viewed:', this.exerciseId);
    console.log('Navigating back to exercise:', this.exerciseId);
    
    // Torna semplicemente alla pagina dell'esercizio corrente
    this.router.navigate(['/workout-details', this.workoutId, this.exerciseId]);
  }
}