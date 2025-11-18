import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { WorkoutService, WorkoutExercise } from '../../../services/workout.service';
import { WorkoutExerciseExplanationPage } from '../exercise-explanation/exercise-explanation.page';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
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
  templateUrl: './exercise-details.page.html',
  styleUrls: ['./exercise-details.page.scss'],
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
  exerciseId: string = ''; // ID iniziale dall'URL
  currentExerciseId: string = ''; // ID dell'esercizio attualmente visualizzato
  exercise: WorkoutExercise | null = null;
  
  // Superset management
  exercises: WorkoutExercise[] = []; // Lista esercizi del superset
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
  isOpeningModal = false;
  environment = environment;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // Recupera i parametri dalla route
    this.route.params.subscribe(async params => {
      this.workoutId = params['workoutId'];
      this.exerciseId = params['exerciseId'];
      if (this.workoutId && this.exerciseId) {
        await this.loadExerciseData();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  async onRefresh(event: any) {
    this.isLoading = true;
    this.exercise = await this.workoutService.loadExercise(this.workoutId, this.exerciseId, true);
    this.isLoading = false;
    if (event?.target) {
      event.target.complete();
    }
  }
  
  private async loadExerciseData(): Promise<void> {
    this.isLoading = true;
    
    // Carica l'esercizio iniziale
    this.currentExerciseId = this.exerciseId;
    this.exercise = await this.workoutService.loadExercise(this.workoutId, this.exerciseId);
    
    if (this.exercise) {
      // Carica il superset
      this.exercises = this.workoutService.getSupersetExercises(this.workoutId, this.exerciseId);
      this.isSuperset = this.exercises.length > 1;
      
      if (this.isSuperset) {
        // Trova l'indice dell'esercizio corrente
        this.currentExerciseIndex = this.exercises.findIndex(ex => ex.id === this.exerciseId);
        if (this.currentExerciseIndex < 0) this.currentExerciseIndex = 0;
        
        setTimeout(() => this.snapToCurrentSlide(), 100);
      }
    }
    
    this.isLoading = false;
  }

  /* UI
  ------------------------------------------------------------ */

  async exerciseExplanation() {
    if (!this.workoutId) return;
    
    // Blocco immediato per click multipli
    if (this.isOpeningModal) {
      return;
    }
    
    // Se è un superset, usa l'ID dell'esercizio corrente nel carousel
    let currentExerciseId = this.exerciseId;
    if (this.isSuperset && this.exercises.length > 0) {
      const currentExercise = this.exercises[this.currentExerciseIndex];
      if (currentExercise) {
        currentExerciseId = currentExercise.id;
      }
    }
    
    await WorkoutExerciseExplanationPage.openModal(
      this.modalController,
      this.workoutId,
      currentExerciseId,
      (isOpening) => { this.isOpeningModal = isOpening; }
    );
  }

  workoutStart() {
    this.router.navigate(['/workout-details', this.workoutId, this.exerciseId, 'training']);
  }

  goBack() {
    this.router.navigate(['/workout-details', this.workoutId]);
  }


  /* Navigazione superset
  ------------------------------------------------------------ */

  nextExercise(): void {
    if (!this.isSuperset || this.exercises.length <= 1) return;
    
    this.currentExerciseIndex = (this.currentExerciseIndex + 1) % this.exercises.length;
    this.updateCurrentExercise();
    this.snapToCurrentSlide();
  }

  prevExercise(): void {
    if (!this.isSuperset || this.exercises.length <= 1) return;
    
    this.currentExerciseIndex = this.currentExerciseIndex > 0 
      ? this.currentExerciseIndex - 1 
      : this.exercises.length - 1;
    this.snapToCurrentSlide();
  }
  
  onSlideChange(event: any): void {
    if (!this.isSuperset) return;
    
    // Aggiorna l'indice corrente
    this.currentExerciseIndex = event.detail.activeIndex || 0;
    this.updateCurrentExercise();
  }
  
  private async updateCurrentExercise(): Promise<void> {
    if (this.exercises[this.currentExerciseIndex]) {
      const newExerciseId = this.exercises[this.currentExerciseIndex].id;
      if (newExerciseId !== this.currentExerciseId) {
        this.currentExerciseId = newExerciseId;
        this.exercise = await this.workoutService.loadExercise(this.workoutId, this.currentExerciseId);
      }
    }
  }
  

  /* Slider
  ------------------------------------------------------------ */

  onSwipe(event: any): void {
    if (!this.isSuperset) return;

    // Più sensibile: soglia ridotta a 30px
    if (event.deltaX > 30) { // Swipe verso destra
      this.prevExercise();
    } else if (event.deltaX < -30) { // Swipe verso sinistra
      this.nextExercise();
    }
  }
  
  onTouchStart(event: TouchEvent): void {
    if (!this.isSuperset) return;
    this.isDragging = true;
    this.touchStartX = event.touches[0].clientX;
    this.startTranslateX = -this.currentExerciseIndex * 100; // Usa la posizione corrente della slide
  }
  
  onTouchMove(event: TouchEvent): void {
    if (!this.isSuperset || !this.isDragging) return;
    
    event.preventDefault();
    const currentX = event.touches[0].clientX;
    const deltaX = currentX - this.touchStartX;
    
    this.updateSlidePosition(deltaX);
  }
  
  onTouchEnd(event: TouchEvent): void {
    if (!this.isSuperset || !this.isDragging) return;
    
    this.isDragging = false;
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleDragEnd();
    
    // Reset delle variabili
    this.touchStartX = 0;
    this.touchEndX = 0;
  }
  
  onMouseDown(event: MouseEvent): void {
    if (!this.isSuperset) return;
    this.isMouseDown = true;
    this.isDragging = true;
    this.mouseStartX = event.clientX;
    this.startTranslateX = -this.currentExerciseIndex * 100; // Usa la posizione corrente della slide
  }
  
  onMouseMove(event: MouseEvent): void {
    if (!this.isSuperset || !this.isMouseDown || !this.isDragging) return;
    
    const currentX = event.clientX;
    const deltaX = currentX - this.mouseStartX;
    
    this.updateSlidePosition(deltaX);
  }
  
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
    const minTranslate = -(this.exercises.length - 1) * 100; // Ultima slide
    
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
      } else if (deltaX < 0 && this.currentExerciseIndex < this.exercises.length - 1) {
        // Swipe verso sinistra - prossimo esercizio (solo se non è l'ultimo)
        this.nextExercise();
        return;
      }
    }
    
    // Se non abbiamo superato la soglia o siamo ai bordi, torna alla posizione corrente
    this.snapToCurrentSlide();
  }
  
  private snapToCurrentSlide(): void {
    const container = document.querySelector('.exercise-slides-container') as HTMLElement;
    if (!container) return;

    const targetX = -this.currentExerciseIndex * 100;
    container.style.transition = 'transform 0.3s ease-in-out';
    container.style.transform = `translateX(${targetX}%)`;
    this.currentTranslateX = targetX;
  }
}