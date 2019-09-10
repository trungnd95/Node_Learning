const axios = require('axios');
const domPurify = require("dompurify");


function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/stores/${store.slug} "class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
}


function typeAhead(search) {
  if (!search) return;
  const searchInput = search.querySelector("input[name='search']");
  const searchResults = search.querySelector('.search__results');
  searchInput.addEventListener('input', function () {
    console.log(this.value);
    //--- If there is no vaue, quit it
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }
    // show the search results
    searchResults.style.display = 'block';
    searchResults.innerHTML = '';

    //  send request ajax search
    axios
      .get(`/api/stores/search?q=${this.value}`)
      .then(res => {
        if (res.data.stores.length) {
          searchResults.innerHTML = domPurify.sanitize(searchResultsHTML(res.data.stores));
        }
      })
      .catch(err => {
        console.error(err);
      })
  })
}

export default typeAhead;