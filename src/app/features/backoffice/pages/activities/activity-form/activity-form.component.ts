import { HttpErrorResponse } from '@angular/common/http';
import { Activities } from '@app/core/models/activities.interfaces';
import { NewActivity } from '@core/models/activities.interfaces';
import { activitiesState } from '@app/core/models/activities-state.interface';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HttpService } from "@app/core/services/http.service";
import { ChangeEvent } from "@ckeditor/ckeditor5-angular";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Observable, Subscription } from "rxjs";
import { MessageService } from "primeng/api";
import { PrivateApiService } from "@app/core/services/privateApi.service";
import { Store } from '@ngrx/store';
import { fromRoot } from '@app/core/redux/activities/activities.index';
@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.scss'],
  providers: [MessageService],
})
export class ActivityFormComponent implements OnInit, OnChanges, OnDestroy {
  title = 'base-ong-angular-client';

  @Input() formTitle: string;
  @Input() defaultName: string | null | undefined;
  @Input() defaultImage: string | null | undefined;
  @Input() defaultDescription: string | boolean | null | undefined = "";
  @Input() voidCKeditor: boolean = false; //

  form: FormGroup = new FormGroup(
    {
      name: new FormControl('', Validators.required),
      image: new FormControl('', Validators.required),
      description: new FormControl(''),
    },
    { updateOn: 'change' }
  );

  public Editor = ClassicEditor;
  @ViewChild("image") image: TemplateRef<Event["target"]>;
  imageBuffer: string | ArrayBuffer | null | undefined;
  imgMessage: string;
  submitted: boolean = false;
  displaySubmitSpinner: boolean = false;
  subscription: Subscription;

  error$: Observable<HttpErrorResponse> = new Observable();
  activity$: Observable<Activities> = new Observable();
  
  constructor(
    private http: HttpService,
    private httpPrivate: PrivateApiService,
    private messageService: MessageService,
    private Store: Store<{activitiesState: activitiesState}>
  ) {}

  ngOnInit(): void {
    this.activity$ = this.Store.select(fromRoot.SelectStateOneData);
    this.error$ = this.Store.select(fromRoot.SelectStateError);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // listen to async @Input changes from parent data binding
    if (changes['defaultName']) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    this.form.get('name')?.setValue(this.defaultName);
    this.form.get('description')?.setValue(this.defaultDescription);
    this.form.get('image')?.setValue(this.defaultImage);

    this.imageBuffer = this.defaultImage;
  }

  ckeditorChange({ editor }: ChangeEvent) {
    const EditorData = editor.getData();
    this.form.get('description')?.setValue(EditorData);
  }

  selectFile(event) {
    let file = event.target.files[0];
    if (file.type.match(/image\/*/) == null) {
      this.imgMessage = 'Only images are supported';
      this.imageBuffer = null;
    } else {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgMessage = file.name;
        this.imageBuffer = reader.result;
      };
      reader.onloadend = this.handleReaderLoaded.bind(this);
    }
  }

  handleReaderLoaded(readerEvent) {
    let binaryString = readerEvent.target.result;
    this.form.patchValue({ image: binaryString });
  }

  onSubmit(form: FormGroup) {
    if (!form.valid) {
      this.submitted = true;
    } else {
      this.submitted = false;
      let url = 'http://ongapi.alkemy.org/api/activities';
      this.httpSendActivity(url, form);
    }
  }

  httpSendActivity(url: string, form: FormGroup) {
    this.displaySubmitSpinner = true;
    this.messageService.add({
      severity: 'info',
      summary: 'Cargando actividad...',
    });
    const _body: NewActivity = {
      name: form.get('name')?.value,
      description: form.get('description')?.value,
      image: form.get('image')?.value,
    } 
    
    let _id;
    this.activity$.subscribe( response => {
      _id = response.id
    })
    this.defaultName
    ? this.Store.dispatch(fromRoot.updateActivities( { id:_id, body:_body} ) )
    : this.Store.dispatch(fromRoot.insertActivities( {body: _body} )) ;

    this.subscription = (
      this.Store.select(fromRoot.SelectStateOneData)
    ).subscribe(
      (response) => {
        this.displaySubmitSpinner = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Enviado!',
          detail: 'La actividad fue cargada exitosamente.',
        });
      },
      (err) => {
        this.displaySubmitSpinner = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `${err.status} ${err.statusText}`,
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
