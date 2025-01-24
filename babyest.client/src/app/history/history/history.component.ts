import { Component, OnInit } from '@angular/core';
import { SingleActivityComponent } from '../../single-activity/single-activity.component';
import { KidService } from '../../services/KidService/kid.service';
import { KidActivity } from '../../models/kid-activity';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { NgFor, NgIf } from '@angular/common';
import { LoadingSpinnerComponent } from "../../loading-spinner/loading-spinner.component";
import { ActivityNameTranslator } from '../../utils/activity-name-translator';
import { FormsModule } from '@angular/forms';
import { DateConverter } from '../../utils/date-converter';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SingleActivityComponent, NgFor, NgIf, LoadingSpinnerComponent, FormsModule],
  providers: [DateConverter],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {

  constructor(private kidService: KidService,
    private currentKidService: CurrentKidService,
    private dateConverter: DateConverter) {
    this.kidId = this.currentKidService.getCurrentKid();
  }

  kidId: number = 0;

  translator: ActivityNameTranslator = new ActivityNameTranslator();
  activities: KidActivity[] = [];

  isLoading: boolean = true;

  selectedEditingAct: KidActivity = { Id: 0, ActivityType: '', EndDate: new Date(), StartDate: new Date(), IsActiveNow: false, KidName: '' };

  isEditingKid: boolean = false;

  testDate: Date = new Date();


  startDateString: string = '';
  endDateString: string = '';
  selectedActivityType: string = '';
  activityTypeLocalUA: string = '';

  ngOnInit(): void {
    const currentKidId = this.currentKidService.getCurrentKid();
    this.kidService.getKidActivitiesById(currentKidId).subscribe({
      next: (data: KidActivity[]) => {
        this.activities = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err.message);
        this.isLoading = false;
      }
    })
  }

  editActivity(actId: number): void {

    // Close the editing mini-window on the 2nd click to the same activity.
    if (this.selectedEditingAct.Id == actId && this.isEditingKid == true) {
      this.isEditingKid = false;
    }
    else {
      this.selectedEditingAct = this.activities.find((el) => el.Id == actId)!;
      this.isEditingKid = true;

      // Set the values in input fields.
      this.startDateString = this.dateConverter.shitDateToISOString(this.selectedEditingAct.StartDate!);
      this.endDateString = this.dateConverter.shitDateToISOString(this.selectedEditingAct.EndDate!);
      this.activityTypeLocalUA = this.translator.changeCurrentActivityFullNameUA(this.selectedEditingAct.ActivityType);
      this.selectedActivityType = this.selectedEditingAct.ActivityType;

    }
  }

  saveChangesActivity(): void {

    this.kidService.updateActivity(this.kidId, this.selectedEditingAct)
      .subscribe({
        next: () => {
          // After the input fields were changed we set them to the selected activity
          // To display updated values after it was saved.
          this.selectedEditingAct.ActivityType = this.selectedActivityType;
          this.selectedEditingAct.StartDate = new Date(this.startDateString);
          this.selectedEditingAct.EndDate = new Date(this.endDateString);
          
          this.isEditingKid = false;
        },
        error: (err) => console.log(err)
      });
  }

  deleteActivity(): void {

  }


}
