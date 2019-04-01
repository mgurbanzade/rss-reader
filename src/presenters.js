const feed = document.querySelector('#feedAccordion');
const inputField = document.querySelector('#inputField');
const submitBtn = document.querySelector('#submitBtn');
const loadingSpinner = document.querySelector('#loadingSpinner');

const presentFeedChildItem = item => `<li class="list-group-item"><a href="${item.link}" target="_blank">${item.title}</a></li>`;

const presentFeed = (state) => {
  const feedMarkup = state.map((feedObj, index) => `<div class="card">
      <div class="card-header" id="feed-item-${index}">
        <h5 class="mb-0">
          <button class="btn btn-link collapsed text-left" type="button" data-toggle="collapse" data-target="#collapse-${index}" aria-expanded="true" aria-controls="collapse-${index}">
            ${feedObj.feedTitle}
          </button>
          <small class="text-muted">${feedObj.feedDescr}</small>
        </h5>
      </div>

      <div id="collapse-${index}" class="collapse" aria-labelledby="feed-item-${index}" data-parent="#feedAccordion">
        <div class="card-body">
          <ul class="list-group">
            ${feedObj.feedChildren.map(child => presentFeedChildItem(child)).join('')}
          </ul>
        </div>
      </div>
    </div>`);

  feed.innerHTML = feedMarkup.join('');
  inputField.value = '';
  inputField.classList.remove('is-valid');
};

const presentForm = (isValidURL) => {
  inputField.removeAttribute('class');
  inputField.classList.add('form-control');

  if (isValidURL) {
    inputField.classList.add('is-valid');
    submitBtn.disabled = false;
  } else {
    inputField.classList.add(isValidURL ? 'is-valid' : 'is-invalid');
    submitBtn.disabled = true;
  }
};

const presentSubmitBtn = (loadingResponse) => {
  if (loadingResponse) {
    loadingSpinner.classList.remove('d-none');
    submitBtn.disabled = true;
  } else {
    loadingSpinner.classList.add('d-none');
    submitBtn.disabled = false;
  }
};
export { presentFeed, presentForm, presentSubmitBtn };
