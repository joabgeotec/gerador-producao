import * as moment from 'moment';
import * as XLSX from 'xlsx';
import {AfterViewInit, Component, OnInit, EventEmitter, Output, Renderer2, ViewChild, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatCalendar} from '@angular/material/datepicker';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Gerador de Produção';
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  daysSelected: string[] = new Array();
  displayedColumns: string[] = ['id', 'day', 'hours'];
  dataSource = new MatTableDataSource();
  hoursInput: any = {};
  dataToExport: any = {};
  fileName= 'ExcelSheet.xlsx';

  @ViewChild('calendar')
  calendar: MatCalendar<moment.Moment>;

  @ViewChild(MatSort) sort: MatSort;

  constructor(private _formBuilder: FormBuilder,
              private renderer: Renderer2) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
    setTimeout(() => {
          this.removeActiveDate();
    }, 500);
    this.createTableHtmlToExport();
  }

  getChangedValue(e: any)  {
    //console.log(moment(e).format('LL'))
    this.daysSelected.push(moment(e).format('LL'));
    this.highlightDays(this.daysSelected, e);
    //console.dir(this.calendar);
  }

  private highlightDays(days: string[], e: any) {
    const dayElements = document.querySelectorAll(
      'mat-calendar .mat-calendar-table .mat-calendar-body-cell'
    );
    Array.from(dayElements).forEach((element) => {
      const matchingDay = days.find((d) => d === element.getAttribute('aria-label')) !== undefined;

      if (matchingDay) {
        // SE JÁ TIVER A CLASSE AVAILABLE, REMOVE A CLASSE AVAILABLE
        if (moment(e).format('LL') == element.ariaLabel &&
        element.classList[1] == 'available'){
          for (let i = 0; i < this.daysSelected.length; i++) {
            if(element.ariaLabel == this.daysSelected[i]){
              delete this.daysSelected[i];
              this.highlightDays(this.daysSelected, null);
            }
          }
        } else {
          this.renderer.addClass(element, 'available');
          this.renderer.setAttribute(element, 'title', 'Event 1');
        }

      } else {
        this.renderer.removeClass(element, 'available');
        this.renderer.removeClass(element, 'active');
        this.renderer.removeAttribute(element, 'title');
      }
    });
  }

  private removeActiveDate() {
    const dayElements = document.querySelectorAll(
      '.mat-calendar-body-active'
    );
      dayElements.forEach(element => {
        this.renderer.removeClass(element, 'mat-calendar-body-active');
        this.renderer.removeAttribute(element, 'title');
      });
  }

  mountDataSource() {
    const dataSourceMounted = new Array();

    let i = 0;
    this.daysSelected.forEach(element => {
      dataSourceMounted.push(
        {
          "id": i++,
          "day": moment(new Date(element)).format('DD/MM/YYYY'),
          "hours": 1
        }
      )
    });
    for (const key in this.daysSelected) {
      this.hoursInput[key] = 1;
    }

    const dataSourceMatSort = new MatTableDataSource(dataSourceMounted);
    this.dataSource = dataSourceMatSort;
    this.dataSource.sort = this.sort;
  }

  plusOne() {
    for (const key in this.hoursInput) {
      this.hoursInput[key] = this.hoursInput[key] + 1;
    }
    console.log(this.dataSource.data);
  }

  prepareToExport() {
    const table = document.getElementById("table-hours") as HTMLTableElement;

    Array.from(table.rows).forEach((element, index) => {
      if(element.className === "mat-row cdk-row ng-star-inserted"){

        this.dataToExport[index] = {
          "name": this.firstFormGroup.value.firstCtrl,
          "day": element.cells[1].textContent,
          "hours": element.getElementsByTagName("input")[0].value
        };

      }
    });
    //TODO: montar tabela excel escondida com o modelo pra exportar pra excel
    console.log(this.dataToExport);
  }

  private createTableHtmlToExport() {
    let tableHidden = document.createElement("table");
    tableHidden.setAttribute("id","table-hours-to-export");

    let thead = document.createElement("thead");
    tableHidden.appendChild(thead);

    console.log(tableHidden);
  }

  exportExcel(): void {
       /* table id is passed over here */
       let element = document.getElementById('table-hours-to-export');
       const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

       /* generate workbook and add the worksheet */
       const wb: XLSX.WorkBook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

       /* save to file */
       XLSX.writeFile(wb, this.fileName);

  }

}
