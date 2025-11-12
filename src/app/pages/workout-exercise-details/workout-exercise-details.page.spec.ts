import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutExerciseDetailsPage } from './workout-exercise-details.page';

describe('WorkoutExerciseDetailsPage', () => {
  let component: WorkoutExerciseDetailsPage;
  let fixture: ComponentFixture<WorkoutExerciseDetailsPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WorkoutExerciseDetailsPage]
    });
    fixture = TestBed.createComponent(WorkoutExerciseDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});