import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugInputSearchComponent } from './drug-input-search.component';
import { ApiCmsManagementService } from '../../../../business/services/api-cms-management.service';
import { LoggerService } from '../../../services/logger.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from '../../../services/app-config.service';
import { SharedModule } from '../../../shared.module';
import { TestingModule } from '../../../util/test/testing.module';

describe('DrugInputSearchComponent', () => {
  let component: DrugInputSearchComponent;
  let fixture: ComponentFixture<DrugInputSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugInputSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
