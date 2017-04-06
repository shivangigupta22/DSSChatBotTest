"use strict";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

var express = require('express'),
    app = express();
app.set('port', process.env.PORT || 5000);

let Botkit = require('botkit'),
    formatter = require('./modules/slack-formatter'),
    salesforce = require('./modules/salesforce'),

    controller = Botkit.slackbot(),

    bot = controller.spawn({
        token: SLACK_BOT_TOKEN
    });

bot.startRTM(err => {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});

controller.hears(['hello(.*)','^hi$'], 'direct_message,direct_mention,mention', (bot, message) => {
	var userid = message.user;
	var name = this.users[userid].name;
    bot.reply(message, 'Hello!! '+username+' '+name+':wave:');
});

controller.hears(['how are you(.*)','h r u(.*)','hru(.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, get_response());
});

function get_response(){
  var responses = [
    'I am fine. Thankyou.',
    'I am fine! How can I help you?'
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/*
controller.hears(['Describe table'], 'direct_message,direct_mention,mention', (bot, message) => {
   let name = message.match[1];
    salesforce.findTable(name)
        .then(accounts => bot.reply(message, {
            text: "Table " + name + " decription:",
            attachments: formatter.formatTableDescription(accounts)
        }))
        .catch(error => bot.reply(message, error));
});

controller.hears(['Describe table1'], 'direct_message,direct_mention,mention', (bot, message) => {
   let name = message.match[1];
    salesforce.findTable1(name)
        .then(accounts => bot.reply(message, {
            text: "Table " + name + " decription:",
            attachments: formatter.formatTableDescription(accounts)
        }))
        .catch(error => bot.reply(message, error));
});

controller.hears(['Show tables'], 'direct_message,direct_mention,mention', (bot, message) => {
   //let name = message.match[1];
    salesforce.findTableNames()
        .then(accounts => bot.reply(message, {
            //text: "Table " + name + " decription:",
			text: "Table names:",
            attachments: formatter.formatAccounts(accounts)
        }))
        .catch(error => bot.reply(message, error));
});
*/
controller.hears(['help'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, {
        text: `You can ask me things like:
	"hello" or "hi"
	"how are you" or "hru"
    "Search account Acme" or "Search Acme in acccounts"
    "Search contact Lisa Smith" or "Search Lisa Smith in contacts"
    "Search opportunity Big Deal"
	"See Report AccountReport"
    "Create contact"
    "Create case"`
    });
});


controller.hears(['search account (.*)', 'search (.*) in accounts'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findAccount(name)
        .then(accounts => bot.reply(message, {
            text: "I found these accounts matching  '" + name + "':",
            attachments: formatter.formatAccounts(accounts)
        }))
        .catch(error => bot.reply(message, error));
});

controller.hears(['search contact (.*)', 'find contact (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let name = message.match[1];
    salesforce.findContact(name)
        .then(contacts => bot.reply(message, {
            text: "I found these contacts matching  '" + name + "':",
            attachments: formatter.formatContacts(contacts)
        }))
        .catch(error => bot.reply(message, error));
});

controller.hears(['top (.*) deals', 'top (.*) opportunities'], 'direct_message,direct_mention,mention', (bot, message) => {
    let count = message.match[1];
    salesforce.getTopOpportunities(count)
        .then(opportunities => bot.reply(message, {
            text: "Here are your top " + count + " opportunities:",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));
});

controller.hears(['search opportunity (.*)', 'find opportunity (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let name = message.match[1];
    salesforce.findOpportunity(name)
        .then(opportunities => bot.reply(message, {
            text: "I found these opportunities matching  '" + name + "':",
            attachments: formatter.formatOpportunities(opportunities)
        }))
        .catch(error => bot.reply(message, error));

});

//Custom method
controller.hears(['Serch Report (.*)', 'See Report (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let name = message.match[1];
    salesforce.findReport(name)
        .then(reports => bot.reply(message, {
            text: "I found these reports matching  '" + name + "':",
            attachments: formatter.formatOpportunities(reports)
        }))
        .catch(error => bot.reply(message, error));

});


controller.hears(['create case', 'new case'], 'direct_message,direct_mention,mention', (bot, message) => {

    let subject,
        description;

    let askSubject = (response, convo) => {

        convo.ask("What's the subject?", (response, convo) => {
            subject = response.text;
            askDescription(response, convo);
            convo.next();
        });

    };

    let askDescription = (response, convo) => {

        convo.ask('Enter a description for the case', (response, convo) => {
            description = response.text;
            salesforce.createCase({subject: subject, description: description})
                .then(_case => {
                    bot.reply(message, {
                        text: "I created the case:",
                        attachments: formatter.formatCase(_case)
                    });
                    convo.next();
                })
                .catch(error => {
                    bot.reply(message, error);
                    convo.next();
                });
        });

    };

    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, askSubject);

});

controller.hears(['create contact', 'new contact'], 'direct_message,direct_mention,mention', (bot, message) => {

    let firstName,
        lastName,
        title,
        phone;

    let askFirstName = (response, convo) => {

        convo.ask("What's the first name?", (response, convo) => {
            firstName = response.text;
            askLastName(response, convo);
            convo.next();
        });

    };

    let askLastName = (response, convo) => {

        convo.ask("What's the last name?", (response, convo) => {
            lastName = response.text;
            askTitle(response, convo);
            convo.next();
        });

    };

    let askTitle = (response, convo) => {

        convo.ask("What's the title?", (response, convo) => {
            title = response.text;
            askPhone(response, convo);
            convo.next();
        });

    };

    let askPhone = (response, convo) => {

        convo.ask("What's the phone number?", (response, convo) => {
            phone = response.text;
            salesforce.createContact({firstName: firstName, lastName: lastName, title: title, phone: phone})
                .then(contact => {
                    bot.reply(message, {
                        text: "I created the contact:",
                        attachments: formatter.formatContact(contact)
                    });
                    convo.next();
                })
                .catch(error => {
                    bot.reply(message, error);
                    convo.next();
                });
        });

    };

    bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, askFirstName);

});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
