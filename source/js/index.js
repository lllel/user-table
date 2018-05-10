class UsersTable {
  constructor(options) {
    this.elem = options.elem;
    this.data = options.data;
    this.table = this.elem.querySelector('.user-data__table');
    this.tbody = this.table.querySelector('tbody');
    this.tr = this.table.querySelectorAll('.user-data__tr');
    this.headingTr = [...this.table.querySelectorAll('.user-data__td--sorting')];
    this.numberFlag = true;
    this.stringFlag = true;
  }

  addTr(data) {
    const tr = document.createElement('tr');

    if (data) {
      for (let i = 0; i < Object.keys(data).length; i++) {
        if (Object.keys(data)[i] !== 'address' && Object.keys(data)[i] !== 'description') {
          const td = document.createElement('td');

          tr.setAttribute('data-id', `${data[Object.keys(data)[0]]}`);
          td.classList.add('user-data__td');
          td.textContent = data[Object.keys(data)[i]];
          tr.appendChild(td);
        }
      }

      this.tbody.appendChild(tr);
    }
  }

  sortingTr(colNum, type) {
    const tbody = this.table.querySelector('tbody');
    const tr = [...tbody.rows];

    let sortCol;

    switch (type) {
      case 'number':
        if(this.numberFlag) {
          this.numberFlag = false;

          sortCol = function (rowA, rowB) {
            return rowB.cells[colNum].innerHTML - rowA.cells[colNum].innerHTML;
          };

        } else {
          this.numberFlag = true;

          sortCol = function (rowA, rowB) {
            return rowA.cells[colNum].innerHTML - rowB.cells[colNum].innerHTML;
          };
        }

        break;

      case 'string':
        if(this.stringFlag) {
          this.stringFlag = false;

          sortCol = function (rowA, rowB) {
            return rowA.cells[colNum].innerHTML < rowB.cells[colNum].innerHTML ? -1 : 1;
          };
        } else {
          this.stringFlag = true;

          sortCol = function (rowA, rowB) {
            return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML ? -1 : 1;
          };
        }

        break;
    }

    tr.sort(sortCol);
    tbody.append(...tr);
  }

  onTrClick(evt) {
    const evtTarget = evt.target;

    if (evtTarget.classList.contains('user-data__td--sorting')) {
      this.sortingTr(evtTarget.cellIndex, evtTarget.getAttribute('data-type'));

      this.headingTr.forEach((it) => {
        if (it.classList.contains('user-data__td--sorting-up') && it !== evtTarget) {
          it.classList.add('user-data__td--sorting-down');
          it.classList.remove('user-data__td--sorting-up');
        }
      });

      if (evtTarget.classList.contains('user-data__td--sorting-down')) {
        evtTarget.classList.remove('user-data__td--sorting-down');
        evtTarget.classList.add('user-data__td--sorting-up');

      } else {
        evtTarget.classList.remove('user-data__td--sorting-up');
        evtTarget.classList.add('user-data__td--sorting-down');
      }
    }
  }

  init() {
    if (this.data) {
      for (let i = 0; i < this.data.length; i++) {
        this.addTr(this.data[i]);
        [...this.tbody.querySelectorAll('tr')][i].querySelectorAll('td')[0].textContent = `${i + 1}`;
      }
    }

    this.table.addEventListener('click', this.onTrClick.bind(this))
  }
}

async function getData() {
  const data = await fetch('http://www.filltext.com/?rows=32&id={number|1000}&firstName={firstName}&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}');

  return await data.json();
}

async function main() {
  const data = await getData();

  const userTable = new UsersTable({
    elem: document.querySelector('.user-data'),
    data: data
  });

  userTable.init();
}

main();
