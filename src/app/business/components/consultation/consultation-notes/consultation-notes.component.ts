import { AlertService } from '../../../services/alert.service';
import { ApiCmsManagementService } from '../../../services/api-cms-management.service';
import { StoreService } from '../../../services/store.service';
import { FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-consultation-notes',
  templateUrl: './consultation-notes.component.html',
  styleUrls: ['./consultation-notes.component.scss']
})
export class ConsultationNotesComponent implements OnInit {
  @Input() consultationNotes: FormControl;

  templates: {};
  template: any;
  content: string;
  isAppend = true;
  ckeConfig: any;

  constructor(
    private store: StoreService,
    private apiCmsManagementService: ApiCmsManagementService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.templates = this.store.getTemplates();
    console.log('Templates', this.templates);

    this.ckeConfig = {
      // allowedContent: true,
      // extraPlugins: 'divarea',
      toolbarGroups : [
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'clipboard', groups: [ 'undo', 'clipboard' ] },
        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
        { name: 'styles', groups: [ 'styles' ] },
        { name: 'colors', groups: [ 'colors' ] },
        { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
        { name: 'forms', groups: [ 'forms' ] },
        { name: 'links', groups: [ 'links' ] },
        { name: 'insert', groups: [ 'insert' ] },
        { name: 'tools', groups: [ 'tools' ] },
        { name: 'others', groups: [ 'others' ] },
        { name: 'about', groups: [ 'about' ] }
      ],    
      removeButtons : 'Save,Source,NewPage,ExportPdf,Templates,Preview,Print,PasteFromWord,PasteText,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CopyFormatting,RemoveFormat,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Link,Unlink,Anchor,Image,Flash,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,ShowBlocks,About,Styles,Subscript,Superscript,Strike,Format,Cut,Copy,Paste',
      removePlugins : 'exportpdf',
    };
  }

  onTemplateChange(event) {
    if (event) {
      this.apiCmsManagementService
        .loadTemplate(event.type, event.id, this.store.getUser().context['cms-user-id'], this.store.getPatientId())
        .subscribe(
          res => {
            if (res.payload) {
              if (this.isAppend) {
                this.consultationNotes.patchValue(this.consultationNotes.value + '<br>' + res.payload);
              } else {
                this.consultationNotes.patchValue(res.payload);
              }
            }
          },
          err => {
            this.alertService.error(JSON.stringify(err));
          }
        );
    } else {
      // this.consultationNotes.patchValue('');
    }
  }

  onBtnAddClicked() {

  }
}
