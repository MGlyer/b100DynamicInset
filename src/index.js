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
    if (item.type) targetField.setAttribute('type', item.type);
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
  });


  // IDENTITY BUTTONS
  const yesButton = element.querySelector('#yes');
  const noButton = element.querySelector('#no');
  const handleIdentityToggle = (evt) => {
    evt.preventDefault();
    const targetBtn = evt.target.id === 'yes' ? yesButton : noButton;
    const otherBtn = evt.target.id === 'no' ? yesButton : noButton;

    targetBtn.classList.add('active');
    otherBtn.classList.remove('active');

    targetBtn.removeEventListener('click', handleIdentityToggle);
    otherBtn.addEventListener('click', handleIdentityToggle);
  }

  noButton.addEventListener('click', handleIdentityToggle);

  // ERROR MESSAGE
  const putErrorOnField = field => field.classList.add('error');
  const removeErrorOnField = field => field.classList.remove('error');

  const labelError = (errFields) => {
    errFields.forEach(field => putErrorOnField(field.previousSibling))
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

  const scrollToError = () => {
    element.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  const resetErrors = () => {
    element.querySelectorAll('.error').forEach(item => item.classList.remove('error'))
  }


  // SUBMISSION LOGIC

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateAllEmail = () => {
    return Array.from(document.querySelectorAll('[type=email]')).every(emailForm => validateEmail(emailForm.value));
  }

  const handleSubmitButton = () => {
    const submitButton = document.querySelector('#submit-button');
    submitButton.innerHTML = 'Thank You!';
    document.querySelector('#text_input_136F01AF-6B86-45C9-866B-2395BECA51A5').addEventListener('change', () => {
      submitButton.innerHTML = 'Submit'
    })
  }

  const resetForm = () => {
    handleSubmitButton();
    hideErrors();
    element.querySelector('#yes').classList.add('active');
    element.querySelector('#no').classList.remove('active');
    document.querySelectorAll('[data-response=true]').forEach(item => item.value = '');
  }
  
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
        resetForm();
      }
    })
  };

  const checkRequiredFields = () => {
    return Array.from(document.querySelectorAll('[data-required=true]'))
      .filter(field => field.value === '');
  };

  const onSubmit = () => {
    resetErrors();
    const requiredFields = checkRequiredFields();
    const requiredFieldsFilled = requiredFields.length === 0;
    const validEmails = validateAllEmail();
    if (!requiredFieldsFilled || !validEmails) {
      showErrorMsg();
      labelError(requiredFields);
      requiredFields.forEach(putErrorOnField);
      scrollToError();
      return
    }

    sendFeedback()
  };

  element.querySelector('#submit-button').addEventListener('click', onSubmit)

})();