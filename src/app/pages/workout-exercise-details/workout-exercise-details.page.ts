import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, GestureController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { WorkoutService, WorkoutExercise } from '../../services/workout.service';
import { ImagePreloaderService } from '../../services/image-preloader.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
  IonButton,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonIcon
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-workout-exercise-details',
  templateUrl: './workout-exercise-details.page.html',
  styleUrls: ['./workout-exercise-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, 
    IonHeader,
    IonToolbar,
    IonButton,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonIcon
  ]
})
export class WorkoutExerciseDetailsPage implements OnInit, OnDestroy {
  
  workoutId: string = '';
  exerciseId: string = '';
  exercise: WorkoutExercise | null = null;
  
  // Superset management
  supersetExercises: WorkoutExercise[] = [];
  currentExerciseIndex: number = 0;
  isSuperset: boolean = false;
  
  // Touch/swipe handling
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private mouseStartX: number = 0;
  private mouseEndX: number = 0;
  private isMouseDown: boolean = false;
  private isDragging: boolean = false;
  private currentTranslateX: number = 0;
  private startTranslateX: number = 0;
  
  isLoading = true;
  environment = environment;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private loadingController: LoadingController,
    private imagePreloader: ImagePreloaderService
  ) {}

  ngOnInit() {
    // Recupera i parametri dalla route
    this.route.params.subscribe(params => {
      this.workoutId = params['workoutId'];
      this.exerciseId = params['exerciseId'];
      if (this.workoutId && this.exerciseId) {
        this.loadExerciseDetails();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carica i dettagli dell'esercizio dalla cache
   */
  async loadExerciseDetails(reset: boolean = false) {
    if (reset) {
      this.workoutService.clearWorkoutDetailsCache();
    }

    // Prima prova a caricare dalla cache
    const cachedExercise = this.workoutService.getCachedExerciseById(this.workoutId, this.exerciseId);
    
    if (cachedExercise) {
      // Trova l'esercizio nella cache
      this.exercise = cachedExercise;
      this.loadSupersetData();
      this.isLoading = false;
      
      // Precarica l'immagine dell'esercizio
      this.preloadExerciseImage();
      
      return;
    }

    // Se non è in cache, prova a caricare l'intero workout e poi l'esercizio
    const loading = await this.loadingController.create({
      message: environment.ln.generalLoading
    });
    await loading.present();

    const subscription = this.workoutService.getWorkoutDetails(this.workoutId).subscribe({
      next: (response) => {
        if (response.success && response.item) {
          // Ora cerca l'esercizio nel workout appena caricato
          const exercise = this.workoutService.getCachedExerciseById(this.workoutId, this.exerciseId);
          if (exercise) {
            this.exercise = exercise;
            this.loadSupersetData();
            this.preloadExerciseImage();
          }
        }
      },
      complete: () => {
        this.isLoading = false;
        loading.dismiss();
      }
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Ricarica i dati
   */
  async onRefresh(event: any) {
    await this.loadExerciseDetails(true);
    if (event?.target) {
      event.target.complete();
    }
  }

  /**
   * Naviga indietro
   */
  goBack() {
    this.router.navigate(['/workout-details', this.workoutId]);
  }
  

  /**
   * Precarica l'immagine dell'esercizio per migliorare le performance
   */
  private preloadExerciseImage(): void {
    if (!this.exercise?.thumb) return;

    const exerciseImageUrl = `${environment.api.baseUrl.replace('/v1', '')}/assets/media/allenamento_esercizio/${this.exercise.thumb}`;

    // Precarica l'immagine
    this.imagePreloader.preloadImage(exerciseImageUrl).then(() => {
    });
  }

  exerciseExplanation() {
    if (!this.workoutId) return;
    
    // Se è un superset, usa l'ID dell'esercizio corrente nel carousel
    let currentExerciseId = this.exerciseId;
    if (this.isSuperset && this.supersetExercises.length > 0) {
      const currentExercise = this.supersetExercises[this.currentExerciseIndex];
      if (currentExercise) {
        currentExerciseId = currentExercise.id;
      }
    }
    
    // Naviga alla pagina di spiegazione dell'esercizio (senza query params)
    this.router.navigate(['/workout-details', this.workoutId, currentExerciseId, 'explanation']);
  }
  
  workoutStart() {
    
  }

  /**
   * Carica i dati del superset
   */
  private loadSupersetData(): void {
    if (!this.exerciseId || !this.workoutId) return;

    // Ottiene tutti gli esercizi del gruppo (superset)
    this.supersetExercises = this.workoutService.getSupersetExercises(this.workoutId, this.exerciseId);
    
    // Controlla se è un superset (più di 1 esercizio)
    this.isSuperset = this.supersetExercises.length > 1;
    
    if (this.isSuperset && this.exercise) {
      // Trova l'indice dell'esercizio corrente basandosi sull'exerciseId
      this.currentExerciseIndex = this.supersetExercises.findIndex(ex => ex.id === this.exerciseId);
      
      // Se non trova l'esercizio nell'array, prova con l'esercizio principale
      if (this.currentExerciseIndex === -1) {
        this.currentExerciseIndex = this.supersetExercises.findIndex(ex => ex.id === this.exercise!.id);
      }
      
      // Assicurati che l'indice sia valido
      if (this.currentExerciseIndex < 0) {
        this.currentExerciseIndex = 0;
      }
      
      // Inizializza la posizione del carousel
      setTimeout(() => {
        this.snapToCurrentSlide();
      }, 100);
    }
  }

  /**
   * Naviga al prossimo esercizio del superset
   */
  nextExercise(): void {
    if (!this.isSuperset || this.supersetExercises.length <= 1) return;
    
    this.currentExerciseIndex = (this.currentExerciseIndex + 1) % this.supersetExercises.length;
    this.snapToCurrentSlide();
  }

  /**
   * Naviga al precedente esercizio del superset
   */
  prevExercise(): void {
    if (!this.isSuperset || this.supersetExercises.length <= 1) return;
    
    this.currentExerciseIndex = this.currentExerciseIndex > 0 
      ? this.currentExerciseIndex - 1 
      : this.supersetExercises.length - 1;
    this.snapToCurrentSlide();
  }

  /**
   * Gestisce il gesture di swipe per il carousel
   */
  onSwipe(event: any): void {
    if (!this.isSuperset) return;

    // Più sensibile: soglia ridotta a 30px
    if (event.deltaX > 30) { // Swipe verso destra
      this.prevExercise();
    } else if (event.deltaX < -30) { // Swipe verso sinistra
      this.nextExercise();
    }
  }

  /**
   * Touch start handler
   */
  onTouchStart(event: TouchEvent): void {
    if (!this.isSuperset) return;
    this.isDragging = true;
    this.touchStartX = event.touches[0].clientX;
    this.startTranslateX = -this.currentExerciseIndex * 100; // Usa la posizione corrente della slide
  }

  /**
   * Touch move handler - aggiorna la posizione in tempo reale
   */
  onTouchMove(event: TouchEvent): void {
    if (!this.isSuperset || !this.isDragging) return;
    
    event.preventDefault();
    const currentX = event.touches[0].clientX;
    const deltaX = currentX - this.touchStartX;
    
    this.updateSlidePosition(deltaX);
  }

  /**
   * Touch end handler  
   */
  onTouchEnd(event: TouchEvent): void {
    if (!this.isSuperset || !this.isDragging) return;
    
    this.isDragging = false;
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleDragEnd();
    
    // Reset delle variabili
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  /**
   * Mouse down handler
   */
  onMouseDown(event: MouseEvent): void {
    if (!this.isSuperset) return;
    this.isMouseDown = true;
    this.isDragging = true;
    this.mouseStartX = event.clientX;
    this.startTranslateX = -this.currentExerciseIndex * 100; // Usa la posizione corrente della slide
  }

  /**
   * Mouse move handler
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.isSuperset || !this.isMouseDown || !this.isDragging) return;
    
    const currentX = event.clientX;
    const deltaX = currentX - this.mouseStartX;
    
    this.updateSlidePosition(deltaX);
  }

  /**
   * Mouse up handler
   */
  onMouseUp(event: MouseEvent): void {
    if (!this.isSuperset || !this.isMouseDown) return;
    
    this.isMouseDown = false;
    this.isDragging = false;
    this.mouseEndX = event.clientX;
    this.handleDragEnd();
    
    // Reset delle variabili
    this.mouseStartX = 0;
    this.mouseEndX = 0;
  }

  /**
   * Aggiorna la posizione della slide durante il drag
   */
  private updateSlidePosition(deltaX: number): void {
    const container = document.querySelector('.exercise-slides-container') as HTMLElement;
    if (!container) return;

    // Converti i pixel in percentuale basata sulla larghezza del container
    const containerWidth = container.offsetWidth;
    const deltaPercent = (deltaX / containerWidth) * 100;
    
    // Calcola la nuova posizione
    const baseTranslate = -this.currentExerciseIndex * 100;
    this.currentTranslateX = baseTranslate + deltaPercent;
    
    // Limita il movimento ai bordi con resistenza
    const maxTranslate = 0; // Prima slide
    const minTranslate = -(this.supersetExercises.length - 1) * 100; // Ultima slide
    
    let finalTranslateX = this.currentTranslateX;
    
    if (this.currentTranslateX > maxTranslate) {
      // Resistenza a sinistra (prima slide)
      const excess = this.currentTranslateX - maxTranslate;
      finalTranslateX = maxTranslate + excess * 0.2; // Resistenza forte
    } else if (this.currentTranslateX < minTranslate) {
      // Resistenza a destra (ultima slide)
      const excess = this.currentTranslateX - minTranslate;
      finalTranslateX = minTranslate + excess * 0.2; // Resistenza forte
    }

    // Disabilita temporaneamente la transizione per movimento fluido
    container.style.transition = 'none';
    container.style.transform = `translateX(${finalTranslateX}%)`;
  }

  /**
   * Gestisce la fine del drag
   */
  private handleDragEnd(): void {
    const container = document.querySelector('.exercise-slides-container') as HTMLElement;
    if (!container) return;

    // Riabilita le transizioni
    container.style.transition = 'transform 0.3s ease-in-out';

    // Calcola la direzione e l'intensità del movimento
    const containerWidth = container.offsetWidth;
    const swipeThresholdPx = containerWidth * 0.25; // 25% della larghezza del container
    
    const startX = this.touchStartX || this.mouseStartX;
    const endX = this.touchEndX || this.mouseEndX;
    const deltaX = endX - startX;

    // Controlla se abbiamo superato la soglia per cambiare slide
    if (Math.abs(deltaX) > swipeThresholdPx) {
      if (deltaX > 0 && this.currentExerciseIndex > 0) {
        // Swipe verso destra - precedente esercizio (solo se non è il primo)
        this.prevExercise();
        return;
      } else if (deltaX < 0 && this.currentExerciseIndex < this.supersetExercises.length - 1) {
        // Swipe verso sinistra - prossimo esercizio (solo se non è l'ultimo)
        this.nextExercise();
        return;
      }
    }
    
    // Se non abbiamo superato la soglia o siamo ai bordi, torna alla posizione corrente
    this.snapToCurrentSlide();
  }

  /**
   * Ottiene la posizione corrente del translateX in percentuale
   */
  private getCurrentTranslateX(): number {
    return -this.currentExerciseIndex * 100;
  }

  /**
   * Snap alla slide corrente
   */
  private snapToCurrentSlide(): void {
    const container = document.querySelector('.exercise-slides-container') as HTMLElement;
    if (!container) return;

    const targetX = -this.currentExerciseIndex * 100;
    container.style.transition = 'transform 0.3s ease-in-out';
    container.style.transform = `translateX(${targetX}%)`;
    this.currentTranslateX = targetX;
  }
}