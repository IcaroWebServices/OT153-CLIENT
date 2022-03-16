import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { emailValidator, digitValidator, allDigitValidator } from '@app/core/util/validators/form.validators';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent implements OnInit {
  private frmContact: FormGroup;
  private emailFormControl: FormControl = new FormControl('', [Validators.required, emailValidator()]);
  private nameFormControl: FormControl = new FormControl('', [Validators.required]);
  private phoneFormControl: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    allDigitValidator(),
  ]);
  private messageFormControl: FormControl = new FormControl('', [Validators.required]);

  private name: string;
  private phone: string;
  private email: string;
  private message: string;

  constructor(private formBuilder: FormBuilder, private toastMessage: MessageService) {}

  ngOnInit(): void {
    this.frmContact = this.registerForm();
  }

  registerForm(): FormGroup {
    return this.formBuilder.group({
      name: this.nameFormControl,
      phone: this.phoneFormControl,
      email: this.emailFormControl,
      message: this.messageFormControl,
    });
  }

  submit() {
    if (this.formContact.valid) {
      this.name = this.nameControl.value;
      this.phone = this.phoneControl.value;
      this.email = this.emailControl.value;
      this.message = this.messageControl.value;
      this.toast();
    }
  }
    
  private toast(){
    this.toastMessage.add({ key:'toastMessage', severity:'success', summary:'Enviado' });
  }

  controlForm(key: string): FormControl {
    return this.frmContact.controls[key] as FormControl;
  }

  get formContact(): FormGroup {
    return this.frmContact;
  }

  get nameControl(): FormControl {
    return this.controlForm('name');
  }

  get phoneControl(): FormControl {
    return this.controlForm('phone');
  }

  get emailControl(): FormControl {
    return this.controlForm('email');
  }

  get messageControl(): FormControl {
    return this.controlForm('message');
  }
}
