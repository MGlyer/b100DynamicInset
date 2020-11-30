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
    if (item.required) targetField.setAttribute('data-required', true);
    // console.log(targetField)


    targetLabel.innerHTML = item.text;
    targetLabel.classList.add('input-label');
    targetField.classList.add(`size-${item.boxSize}`);
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

  const showErrorMsg = () => {
    const errMsg = element.querySelector('.error-container');
    errMsg.classList.remove('inactive');
  }

  const hideErrors = () => {
    const errMsg = element.querySelector('.error-container');
    const fields = document.querySelectorAll('input');
    errMsg.classList.add('inactive');
    fields.forEach(removeErrorOnField);
  }


  // SUBMISSION LOGIC
  
  const sendFeedback = () => {
    const payload = {
      "email_4E75E544-ABF9-4FDC-8A15-BE4806ADC894": "Nominator's email RESPONSE VAL",
      "name_98F5D95D-8FBE-4A79-9A9F-9A0702E07078": "Nominator's name RESPONSE VAL",
      "text_input_789CFD48-7D0A-405B-846B-2CA9795706A4": "Nominator's company, job title RESPONSE VAL",
      "contact_1933B26A-1BB2-45AF-88DB-AFAA27C5FB36": "Nominator's contact info (phone) RESPONSE VAL",
      "text_input_63176022-E1BA-406E-B334-DAA0BF8DE133": "Nominator's relationship to nominee RESPONSE VAL",
      "dropdown_8982D47C-423E-4CCE-A6D5-95F841E29E2F": "Do you want to your identity to be revealed as a nominator? RESPONSE VAL",
      "text_input_136F01AF-6B86-45C9-866B-2395BECA51A5": "Nominee's name RESPONSE VAL",
      "text_input_E68A6D22-CB04-4820-9051-46DA2F00C525": "Nominee's company and job title RESPONSE VAL",
      "email_B093DF61-FA5A-4EB5-B1DF-9881BDD81108": "Nominee's email RESPONSE VAL",
      "contact_93B4DCAA-86DA-4C0C-B144-70423C3DA0F2": "Nominee's contact (phone) RESPONSE VAL",
      "text_area_564A8B4C-2818-4D2B-9E0B-ECA2CEED5EA1": "Nominee's education RESPONSE VAL",
      "text_area_861A436F-D4B6-41F4-8A3E-300288C661C3": "Description of nominee's current job or role, including key responsibilities RESPONSE VAL",
      "text_area_2D42ECB1-0B55-4CC4-9F6B-F964BBE3BC45": "Nominee's achievements and successes in this job RESPONSE VAL",
      "text_area_92E98DF2-F9B2-40BF-B257-F241990982D3": "Describe the nominee's influence within the firm and industry RESPONSE VAL",
      "text_area_AC170692-38BD-4B86-9E00-DBFAF22FECD7": "Nominee's role as a mentor in the workplace RESPONSE VAL",
      "text_area_A2118387-7F86-4FBB-821D-6953F337C1C1": "Nominee's prior jobs or positions RESPONSE VAL",
      "text_area_7130C671-C18A-4CA5-A833-78DE06C9747D": "Testimonials, if any, from mentors, bosses, clients or peers RESPONSE VAL"
    }
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
      requiredFields.forEach(putErrorOnField)
      return
    }

    sendFeedback()
  };

  element.querySelector('#submit-button').addEventListener('click', onSubmit)

})();