class UsersTable {
  constructor(options) {
    this.elem = options.elem;
    this.data = options.data;
    this.table = this.elem.querySelector('.user-data__table');
    this.tbody = this.table.querySelector('tbody');
    this.tr = this.table.querySelectorAll('.user-data__tr');
    this.headingTr = [...this.table.querySelectorAll('.user-data__td--sorting')];
    this.pagination = this.elem.querySelector('.pagination');
    // this.selectUserContainer = this.elem.querySelector('.select-user');
    this.countTrInPage = 5;
    this.flag = true;
  }

  addTr(data) {
    const tr = document.createElement('tr');

    tr.style.cursor = 'pointer';

    if (data) {
      for (let i = 0; i < Object.keys(data).length; i++) {
        if (Object.keys(data)[i] !== 'address' && Object.keys(data)[i] !== 'description' && Object.keys(data)[i] !== 'id') {
          const td = document.createElement('td');

          tr.setAttribute('data-id', `${data.id}`);
          td.classList.add('user-data__td');
          td.textContent = data[Object.keys(data)[i]];
          tr.appendChild(td);
        }
      }

      tr.insertAdjacentElement('afterbegin', tr.lastElementChild);
      this.tbody.appendChild(tr);
    }
  }

  sortingData(type) {
      if (this.flag) {
        this.flag = false;

        return function (itemA, itemB) {
          return itemA[type] > itemB[type] ? -1 : 1;
        }

      } else {
        this.flag = true;

        return function (itemA, itemB) {
          return itemA[type] > itemB[type] ? 1 : -1;
        }
      }
  }

  addPaginationBtn(num) {
    const btn = document.createElement('li');

    btn.textContent = num;
    btn.className = 'pagination__item';
    btn.setAttribute('data-page', `${num}`);

    return btn;
  }

  addPaginationAllBtns() {
    if (this.data) {
      const count = Math.ceil(this.data.length / this.countTrInPage);

      for (let i = 0; i < count; i++) {
        const btn = this.addPaginationBtn(i + 1);

        this.pagination.appendChild(btn);
      }
    }
  }

  loadData(data, num) {
    const number = (num * this.countTrInPage) - this.countTrInPage;

    data.forEach((it, i) => {
      if (i >= number && i < number + this.countTrInPage) {
        this.addTr(data[i]);
      }
    });
  }

  clearTbody() {
    this.tbody.innerHTML = '';
  }

  findUser(id) {
    let data = this.data;

    data = data.filter((it) => {
      return parseInt(it.id, 10) === parseInt(id, 10);
    });

    return data;
  }

  addUserInfo(item) {
    if (this.elem.querySelector('.select-user')) {
      this.elem.removeChild(this.elem.querySelector('.select-user'))
    }

    const user = item[0];
    const container = document.createElement('div');
    const userName = document.createElement('span');
    const userSurname = document.createElement('span');
    const description = document.createElement('span');
    const street = document.createElement('span');
    const city = document.createElement('span');
    const state = document.createElement('span');
    const zip = document.createElement('span');

    const allName = document.createElement('p');
    const allDescription = document.createElement('p');
    const allStreet = document.createElement('p');
    const allCity = document.createElement('p');
    const allState = document.createElement('p');
    const allZip = document.createElement('p');

    container.className = 'select-user';

    userName.textContent = ` ${user.firstName} `;
    userSurname.textContent = ` ${user.lastName} `;

    allName.textContent = 'Выбран пользователь: ';
    allName.appendChild(userName);
    allName.appendChild(userSurname);

    allDescription.textContent = 'Описание: ';
    description.textContent = user.description;
    allDescription.appendChild(description);

    allStreet.textContent = 'Адрес проживания: ';
    street.textContent = user.address.streetAddress;
    allStreet.appendChild(street);

    allCity.textContent = 'Город: ';
    city.textContent = user.address.city;
    allCity.appendChild(city);

    allState.textContent = 'Штат: ';
    state.textContent = user.address.state;
    allState.appendChild(state);

    allZip.textContent = 'Индекс: ';
    zip.textContent = user.address.zip;
    allZip.appendChild(zip);

    this.elem.appendChild(container);
    container.appendChild(allName);
    container.appendChild(allDescription);
    container.appendChild(allStreet);
    container.appendChild(allCity);
    container.appendChild(allState);
    container.appendChild(allZip);
  }

  onUserClick(evt) {
    const tr = evt.target.closest('tr');
    const dataId = tr.getAttribute('data-id');
    const obj = this.findUser(dataId);

    this.addUserInfo(obj);

    [].forEach.call(this.tbody.querySelectorAll('tr'), (it) => {
      it.className = '';
    })
  }

  onTrClick(evt) {
    const evtTarget = evt.target;

    let dataPage;

    if (evtTarget.classList.contains('user-data__td--sorting')) {
      this.clearTbody();

      [].forEach.call(this.pagination.querySelectorAll('.pagination__item'), (it) => {
        if (it.classList.contains('pagination__item--active')) {
          dataPage = it;

          return dataPage;
        }
      });

      dataPage = dataPage.getAttribute('data-page');

      const newData = this.data.sort(this.sortingData(evtTarget.getAttribute('data-type')));

      this.loadData(newData, dataPage);

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

  onBtnClick(evt) {
    const evtTarget = evt.target;
    const btn = evtTarget.closest('.pagination__item');

    if (!btn || evtTarget.closest('.pagination__item--active')) {
      return null;
    }

    const dataPage = btn.getAttribute('data-page');

    this.clearTbody();
    this.loadData(this.data, dataPage);

    [].forEach.call(this.pagination.querySelectorAll('.pagination__item--active'), (it) => {
      it.classList.remove('pagination__item--active');
    });

    btn.classList.add('pagination__item--active');
  }

  init() {
    if (this.data) {
      for (let i = 0; i < this.countTrInPage; i++) {
        this.addTr(this.data[i]);
      }

      this.table.addEventListener('click', this.onTrClick.bind(this));
      this.pagination.addEventListener('click', this.onBtnClick.bind(this));
      this.table.addEventListener('click', (evt) => {
        if (evt.target.closest('[data-id]')) {
          this.onUserClick(evt);
          evt.target.closest('[data-id]').className = 'active';
        }
      });
      this.addPaginationAllBtns();
      this.pagination.querySelectorAll('.pagination__item')[0].classList.add('pagination__item--active');
    }
  }
}

async function getData() {
  const data = await fetch('http://www.filltext.com/?rows=32&id={number|1000}&firstName={firstName}&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}');

  return await data.json();
}

async function main() {
  const data = await getData().catch((err) => {
    throw new Error(`Не удалось получить данные, ошибка: ${err}`)
  });

  const userTable = new UsersTable({
    elem: document.querySelector('.user-data'),
    data: data.map((it, i) => {
      it['number'] = i + 1;

      return it;
    })
  });

  userTable.init();
}

main();
