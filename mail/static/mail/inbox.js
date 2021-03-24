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
  document.querySelector('#display-email').style.display = 'none';
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
  document.querySelector('#display-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  get_emails_for_mailbox(mailbox)
}

function send_email() {
    let recipients = document.querySelector('#compose-recipients').value
    let subject = document.querySelector('#compose-subject').value
    let body = document.querySelector('#compose-body').value

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
            load_mailbox('sent')
        });

}

function get_emails_for_mailbox(mailbox) {
    fetch('/emails/' + mailbox)
        .then(response => response.json())
        .then(emails => {
            let main_div = document.createElement('div')
            emails.forEach(email => {
                let row = create_email_main_row(mailbox, email)
                main_div.append(row)
            })

            document.querySelector('#emails-view').append(main_div)
        });
}

function create_email_main_row(mailbox, email) {

    let email_row = create_email_row()
    let email_div = create_email_div(email)
    let email_sender = crete_email_sender_column(email)
    let email_subject = create_email_subject_column(email)
    let email_timestamp = create_email_timestamp_column(email)
    let email_recipients = create_email_recipients_column(email)
    let button_to_archive_or_unarchive = create_button_to_archive_or_unarchive(email)

    if (mailbox === 'inbox') {
        email_div.className += ' col-10 row '
        button_to_archive_or_unarchive.className = ' col-2 '
        email_row.className += email.read ? ' background-gray ' : ''

        email_div.append(email_sender)
        email_div.append(email_subject)
        email_div.append(email_timestamp)
        email_row.append(email_div)
        email_row.append(button_to_archive_or_unarchive)

    } else if(mailbox === 'sent') {
        email_timestamp.style.justifyContent = ' flex-end '
        email_div.className = ' col-12 row '

        email_div.append(email_subject)
        email_div.append(email_recipients)
        email_div.append(email_timestamp)
        email_row.append(email_div)
    } else if(mailbox === 'archive') {
        email_timestamp.className = ' text-right '
        email_div.className = ' col-10 row '
        button_to_archive_or_unarchive.className = ' col-2 '

        email_div.append(email_sender)
        email_div.append(email_subject)
        email_div.append(email_timestamp)
        email_row.append(email_div)
        email_row.append(button_to_archive_or_unarchive)
    }

    return email_row
}

function get_single_email(email_id) {

    fetch('/emails/' + email_id)
        .then(response => response.json())
        .then(email => {
            make_email_read(email_id)

            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#display-email').style.display = 'block';

            document.querySelector('#display-email-sender').innerHTML = '<b>From</b> ' + email.sender
            document.querySelector('#display-email-recipients').innerHTML = '<b>To</b> ' + email.recipients
            document.querySelector('#display-email-subject').innerHTML = '<b>Subject:</b> ' + email.subject
            document.querySelector('#display-email-timestamp').innerHTML = '<b>Timestamp:</b> ' + email.timestamp
            document.querySelector('#display-email-body').innerHTML = email.body

            document.querySelector('#reply-to-email-button').addEventListener('click', (e) => {
                reply_to_email(email)
            })
        });
}

function make_email_read(email_id) {

    fetch('/emails/' + email_id, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
    })
}

function make_email_archived_unarchived(email_id, archived) {

    fetch('/emails/' + email_id, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !archived
        })
    })
      .then(result => {
            load_mailbox('inbox')
      })

}

function reply_to_email(email) {
    console.log('reply_to_email here')
    console.log('email is: ', email)

      // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#display-email').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    let subject = email.subject.substring(0, 4) === 'Re: ' ? email.subject : 'Re: ' + email.subject
    let body = '"On ' + email.timestamp + ' ' + email.sender + ' wrote:" ' + '\n' + email.body

    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = body;
}

function create_email_row() {
    let email_row = document.createElement('div')
    email_row.className = ' row email-row '

    return email_row
}

function create_email_div(email) {
    let email_div = document.createElement('div')
    // email_div.className = ' row email-data-div '
    email_div.setAttribute('onclick', 'get_single_email(' + email.id + ')')

    return email_div
}

function crete_email_sender_column(email) {
    let email_sender = document.createElement('div')
    email_sender.innerHTML = email.sender
    email_sender.className = ' col-4 email-column '

    return email_sender
}

function create_email_subject_column(email) {
    let email_subject = document.createElement('div')
    email_subject.innerHTML = email.subject
    email_subject.className = ' col-4 email-column '

    return email_subject
}

function create_email_timestamp_column(email) {
    let email_timestamp = document.createElement('div')
    email_timestamp.innerHTML = email.timestamp
    email_timestamp.className = ' col-4 email-column text-right '

    return email_timestamp
}

function create_email_recipients_column(email) {
    let email_recipients = document.createElement('div')
    email_recipients.innerHTML = email.recipients
    email_recipients.className = ' col-4 email-column '

    return email_recipients
}

function create_button_to_archive_or_unarchive(email) {
    let button_text = email.archived ? 'Send to Inbox' : 'Send to Archive'

    let button_div = document.createElement('div')
    let button = document.createElement('button')

    button.innerHTML = button_text
    button_div.append(button)

    button_div.className = ' text-right col-3 '
    button.className = ' btn btn-info '
    button.setAttribute('onclick', 'make_email_archived_unarchived(' + email.id + ',' + email.archived + ')')

    return button_div
}
