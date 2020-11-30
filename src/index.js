import { slug } from '../inset/data.json';
import './index.scss';
import dataMap from '../utils/dataMap';


(() => {
  const element = document.getElementById(`${slug}-container`);
  element.style.height = 'fit-content';

  // FILL THE FORM
  dataMap.forEach((item) => {
    const target = document.getElementById(item.id);
    const targetLabel = document.createElement("label");
    const targetField = item.boxSize === 'small' ? document.createElement("input") : document.createElement('textarea');
    if (item.type) targetField.setAttribute('type', item.type)
    if (item.forceError) targetField.classList.add('error');
    if (item.required) {
      targetField.setAttribute('data-required', true);
      targetLabel.setAttribute('data-required-label', true);
    }


    targetLabel.innerHTML = item.text;
    targetLabel.classList.add('input-label');
    targetField.classList.add(`size-${item.boxSize}`);
    targetField.setAttribute('data-response', true);
    targetField.id = item.slug;
    target.appendChild(targetLabel);
    target.appendChild(targetField);
  })



  // IDENTITY BUTTONS
  const yesButton = element.querySelector('#yes');
  const noButton = element.querySelector('#no');
  const handleIdentityToggle = (evt) => {
    evt.preventDefault();
    const targetBtn = evt.target.id === 'yes' ? yesButton : noButton;
    const otherBtn = evt.target.id === 'no' ? yesButton : noButton;

    targetBtn.classList.remove('inactive');
    targetBtn.classList.add('active');
    otherBtn.classList.remove('active');
    otherBtn.classList.add('inactive');

    targetBtn.removeEventListener('click', handleIdentityToggle);
    otherBtn.addEventListener('click', handleIdentityToggle);
  }

  noButton.addEventListener('click', handleIdentityToggle);

  // ERROR MESSAGE
  const putErrorOnField = field => field.classList.add('error');
  const removeErrorOnField = field => field.classList.remove('error');

  const labelError = () => {
    document.querySelectorAll('[data-required-label=true]').forEach(putErrorOnField)
  }

  const showErrorMsg = () => {
    const errMsg = element.querySelector('.error-container');
    errMsg.classList.remove('inactive');
  }

  const hideErrors = () => {
    const errMsg = element.querySelector('.error-container');
    const fields = document.querySelectorAll('input');
    const labels = document.querySelectorAll('label');
    errMsg.classList.add('inactive');
    fields.forEach(removeErrorOnField);
    labels.forEach(removeErrorOnField);
  }


  // SUBMISSION LOGIC
  
  const sendFeedback = () => {
    const responses = element.querySelectorAll('[data-response=true]');
    const button = Array.from(element.querySelectorAll('.identity-button'))
      .filter(button => button.classList.contains('active'));

    const payload = {
      "dropdown_8982D47C-423E-4CCE-A6D5-95F841E29E2F": button[0].getAttribute('data-response')
    };

    responses.forEach(response => payload[response.id] = response.value)
    
    const formUrl = 'https://10nk3u5ov4.execute-api.us-east-1.amazonaws.com/prod/v1/feedback/b60b15be-9468-4880-a6ed-ab79ca63c1a6';

    fetch(formUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    }).then(response => response.json())
    .then(resJson => {
      if(resJson.id) {
        hideErrors();
        const submitButton = document.querySelector('#submit-button');
        submitButton.innerHTML = 'Thank You!';
      }
    })
  };

  const checkRequiredFields = () => {
    return Array.from(document.querySelectorAll('[data-required=true]'))
      .filter(field => field.value === '');
  };

  const onSubmit = () => {
    const requiredFields = checkRequiredFields();
    const requiredFieldsFilled = requiredFields.length === 0;
    if (!requiredFieldsFilled) {
      showErrorMsg();
      labelError();
      requiredFields.forEach(putErrorOnField)
      return
    }

    sendFeedback()
  };

  element.querySelector('#submit-button').addEventListener('click', onSubmit)

})();