document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#submit-compose-form').addEventListener('click', (e) => {
    e.preventDefault();
    send_email()
})

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  get_emails_for_mailbox(mailbox)
}

function send_email() {
    let recipients = document.querySelector('#compose-recipients').value
    let subject = document.querySelector('#compose-subject').value
    let body = document.querySelector('#compose-body').value
    console.log('recipients are: ', recipients)
    console.log('subject is: ', subject)
    console.log('body is: ', body)

    fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body
            })
        })
        .then(response => response.json())
        .then(result => {
            // Print result
            console.log(result);
            load_mailbox('sent')
        });

}

function get_emails_for_mailbox(mailbox) {
    fetch('/emails/' + mailbox)
        .then(response => response.json())
        .then(emails => {
            let main_div = document.createElement('div')
            main_div.id = 'main_div_id'
            main_div.className = 'row'

            emails.forEach(email => {
                console.log('email is: ', email)
                email_container = document.createElement('div')
                email_link = document.createElement('a')
                email_div = document.createElement('div')

                email_sender = '<p>From: ' + email.sender +'</p>'
                email_subject = '<p>Subject: ' + email.subject + '</p>'
                email_timestamp = '<p>Date: ' + email.timestamp + '</p>'
                email_recipients = '<p>To: ' + email.recipients + '</p>'

                if (mailbox === 'inbox') {
                    email_div.innerHTML = email_subject+ email_sender + email_timestamp
                } else if(mailbox === 'sent') {
                    email_div.innerHTML = email_subject + email_recipients + email_timestamp
                }

                email_link = document.createElement('a')
                email_link.href = 'javascript:void(0)'
                email_link.append(email_div)

                email_container.id = 'email_container_id_' + email.id
                email_container.className = 'col-12 mt-2 main_email_div card'
                email_container.className += email.read === 'true' ? ' background-gray' : ' background-yellow'
                email_container.append(email_link)

                main_div.append(email_container)

            })

            emails_view = document.querySelector('#emails-view')
            emails_view.append(main_div)

        });
}

function get_single_email() {

    fetch('/emails/100')
        .then(response => response.json())
        .then(email => {
            // Print email
            console.log(email);

            // ... do something else with email ...
        });
}

function make_email_read_archived() {

    fetch('/emails/100', {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
    })
}
