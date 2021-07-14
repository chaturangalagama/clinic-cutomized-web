import { FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-consultation-memo',
  templateUrl: './consultation-memo.component.html',
  styleUrls: ['./consultation-memo.component.scss']
})
export class ConsultationMemoComponent implements OnInit {
  @Input() memo: FormControl;
  ckeConfig: any;
  codes: string[];
  constructor() { }

  ngOnInit() {
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
}
