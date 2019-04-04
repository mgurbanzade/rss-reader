const presentFeedChildItem = (item) => {
  const description = item.description.length > 0 ? item.description : 'Description is missing';
  return `<li class="list-group-item">
    <a href="${item.link}" target="_blank" class="article-link block-text mb-3 d-block text-center">${item.title}</a>
    <button type="button" class="btn btn-primary offset-5 col-2" data-toggle="modal" data-target="#modalWindow" data-whatever="${description}">
      Description
    </button>
  </li>`;
};

const presentFeed = (state, feedEl, inputField) => {
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

  feedEl.innerHTML = feedMarkup.join('');
  inputField.value = '';
  inputField.classList.remove('is-valid');
};

const presentForm = (urlState, inputField, submitBtn) => {
  inputField.removeAttribute('class');
  inputField.classList.add('form-control');

  const statePresentersDispatcher = {
    valid: () => {
      inputField.classList.add('is-valid');
      submitBtn.disabled = false;
    },
    invalid: () => {
      inputField.classList.add('is-invalid');
      submitBtn.disabled = true;
    },
  };

  statePresentersDispatcher[urlState]();
};

const presentRequestState = (requestState, submitBtn, spinner) => {
  const statePresentersDispatcher = {
    isProcessing: () => {
      spinner.classList.remove('d-none');
      submitBtn.disabled = true;
    },
    failed: () => {
      spinner.classList.add('d-none');
      submitBtn.disabled = false;
      document.querySelector('#alertBox').innerHTML = `<div class="alert alert-danger mb-0" role="alert">
          Something went wrong :( Please, try again later.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>`;
    },
    succeed: () => {
      spinner.classList.add('d-none');
      submitBtn.disabled = false;
      document.querySelector('#alertBox').innerHTML = `<div class="alert alert-success mb-0" role="alert">
          Yay! A new feed has been added!
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>`;
    },
  };

  statePresentersDispatcher[requestState]();
};

export {
  presentFeed, presentForm, presentRequestState,
};
