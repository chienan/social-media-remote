const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const users = []
let filteredUsers = []
let paginatorData = []

const USERS_PER_PAGE = 16

const dataPanel = document.querySelector('#data-panel')

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const indexView = document.querySelector('#back-to-index')
const myFavorite = document.querySelector('#show-fav-btn')

const selectGender = document.querySelector('#btn-select-gender')
const femaleUser = document.querySelector('#select-by-female')
const maleUser = document.querySelector('#select-by-male')
const regionList = document.querySelector('#region-list')



//渲染資料至頁面
function renderUserList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
        <div class="mt-5 mr-5">
          <div class="card" style="width: 11rem;">
            <img src="${item.avatar}" class="card-img-top" alt="avatar">
            <div class="card-body">
              <h5 class="card-title">${item.name} ${item.surname}</h5>

<div class="d-flex justify-content-end align-items-center">
<a href="#" class="btn btn-light btn-show-user" data-toggle="modal" data-target="#exampleModal" data-id="${item.id}">
glimpse</a>
<div class="add-favorite ml-2">
<i class="far fa-heart btn-add-fav" data-id="${item.id}"></i>
</div>
</div>

            </div>
          </div>
        </div>
    `
    dataPanel.innerHTML = rawHTML
  })
}

function showUserModal(id) {
  console.log('showUserModal')
  const userName = document.querySelector('#user-modal-name')
  const userAge = document.querySelector('#user-modal-age')
  const userRegion = document.querySelector('#user-modal-region')
  const userBirthday = document.querySelector('#user-modal-birthday')
  const userEmail = document.querySelector('#user-modal-email')
  const userAvatar = document.querySelector('#user-modal-avatar')

  axios
    .get(INDEX_URL + id)
    .then((response) => {

      console.log(response.data)

      const data = response.data
      userName.innerText = data.name + ' ' + data.surname
      userAge.innerText = `Age: ${data.age}`
      userRegion.innerText = `Region: ${data.region}`
      userBirthday.innerText = `Birthday: ${data.birthday}`
      userEmail.innerText = `Email: ${data.email}`
      userAvatar.innerHTML = `<img src="${data.avatar}" class="img-fluid">`
    })

  //清空modal資料，避免殘影
  userName.innerText = ''
  userAge.innerText = ''
  userBirthday.innerText = ''
  userEmail.innerText = ''
  userAvatar.innerHTML = ''
}



//add to favorite
function addToFavorite(id) {
  console.log(id)

  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    alert(`remove ${user.name} from favorite list!`)
    return localStorage.removeItem('favoriteUsers', user)
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}


//show favorite list
myFavorite.addEventListener('click', (event) => {
  const myFavoriteList = JSON.parse(localStorage.getItem('favoriteUsers'))

  getUsersByPage(1, myFavoriteList)
  renderPaginator(myFavoriteList.length)
})


//slice data to paginator
function getUsersByPage(page, data) {
  paginatorData = data || paginatorData
  const startIndex = (page - 1) * USERS_PER_PAGE
  let pageData = paginatorData.slice(startIndex, startIndex + USERS_PER_PAGE)

  renderUserList(pageData)
}


//render paginator
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
            <li class="page-item"><a class="page-link" href="javascript:;" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}


//click --> show user model, add to fav
function onPanelClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-fav')) {
    addToFavorite(Number(event.target.dataset.id))
    event.target.classList.toggle('far')
    event.target.classList.toggle('fas')
  }
}


//search-form
function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }

  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword)
    || user.surname.toLowerCase().includes(keyword))

  renderPaginator(filteredUsers.length)
  getUsersByPage(1, filteredUsers)
  console.log(filteredUsers.length)
}



// filter users by gender
function showUsersByGender() {
  let genderResult = []
  const data = filteredUsers.length ? filteredUsers : users

  if (event.target.matches('#select-by-female')) {
    genderResult = data.filter(user => user.gender === 'female')
  } else if (event.target.matches('#select-by-male')) {
    genderResult = data.filter(user => user.gender === 'male')
  } else {
    genderResult = data
  }
  renderPaginator(genderResult.length)
  getUsersByPage(1, genderResult)
}


// filter users by region
function showUsersByRegion(event) {
  let regionResult = []
  let region = event.target.id
  const data = filteredUsers.length ? filteredUsers : users

  if (region === 'all') {
    regionResult = data
  } else {
    regionResult = data.filter(user => user.region === region)
  }

  renderPaginator(regionResult.length)
  getUsersByPage(1, regionResult)
}



//render user list to paginator
function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  getUsersByPage(page)
}



indexView.addEventListener('click', (event) => {
  renderPaginator(users.length)
  getUsersByPage(1, users)
})


//set request to index API
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results)
    renderPaginator(users.length)
    //    renderUserList(getUsersByPage(1, users))
    getUsersByPage(1, users)
  })
  .catch((err) => console.log(err))


paginator.addEventListener('click', onPaginatorClicked)
selectGender.addEventListener('click', showUsersByGender)
regionList.addEventListener('click', showUsersByRegion)
searchForm.addEventListener('submit', onSearchFormSubmitted)
dataPanel.addEventListener('click', onPanelClicked)