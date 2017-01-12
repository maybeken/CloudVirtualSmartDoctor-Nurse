'use strict';
function subtitleTrueFalse(val){
    if(val === 0){
        return "沒有";
    }else if(val === 1){
        return "有";
    }
}

var Alexa = require("alexa-sdk");
var appId = 'amzn1.ask.skill.c0fbef12-0bde-4d66-952b-8645dbad34cb'; //'amzn1.echo-sdk-ams.app.your-skill-id';

var get = require('simple-get');

var Subtitle = require("ar-subtitle-support");
/*
this.emit(':ask', this.t("WELCOME_MSG"));

Convert -->

Subtitle(this, "This is a subtitle", "This
is another one", function(_this){
_this.emit(':ask', _this.t("WELCOME_MSG"));
});
*/

// DB Conenction
var AWS = require('aws-sdk');
var $db = new AWS.DynamoDB();
var DynamoDB = require('aws-dynamodb')($db);

// Language Modules
var translation = require('./translation');

var languageStrings = {
    "en-GB": {
        "translation": translation.TRANSLATION_EN_GB
    },
    "en-US": {
        "translation": translation.TRANSLATION_EN_GB
    }
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.dynamoDBTableName = 'Nurse-Sessions';
    alexa.resources = languageStrings;
    alexa.registerHandlers(
        newSessionHandlers, question1ModeHandlers, question2ModeHandlers, question3ModeHandlers, question4ModeHandlers, question5ModeHandlers, question6ModeHandlers,
        finishmodeHandlers, startGameHandlers, temperatureModeHandlers, glucometerModeHandlers, nameHandlers
    );
    alexa.execute();
};

var states = {
    STARTMODE: '_STARTMODE',  // Prompt the user to start or restart the game.
    QUESTION1MODE: '_QUESTION1MODE',
    QUESTION2MODE: '_QUESTION2MODE',
    QUESTION3MODE: '_QUESTION3MODE',
    QUESTION4MODE: '_QUESTION4MODE',
    QUESTION4MODE: '_QUESTION4MODE',
    QUESTION5MODE: '_QUESTION5MODE',
    QUESTION6MODE: '_QUESTION6MODE',
    FINISHMODE:   '_FINISHMODE',
    TEMPERATUREMODE:   '_TEMPERATUREMODE',
    GLUCOMETERMODE:   '_GLUCOMETERMODE',
    NAMEMODE: '_NAMEMODE'
};

var newSessionHandlers = {
    'NewSession': function() {
        for (var key in this.attributes){
          if (this.attributes.hasOwnProperty(key)){
              this.attributes[key] = undefined;
          }
        }
        this.handler.state = states.STARTMODE;

        Subtitle(this, "歡迎使用問診系統,請說YES繼續或者NO離開", function(_this){
            _this.emit(':ask', _this.t("WELCOME_MSG"),'');
        });
    }
};

var nameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = states.NAMEMODE;//change to states

        Subtitle(this, "你的名字是什麼?", function(_this){
            _this.emit(':ask', 'OK, What is your name ','');//q1
        });
    },
    'AMAZON.NoIntent': function() {
        Subtitle(this, "再見", function(_this){
            _this.emit(':tell', 'Good Bye');
        });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },

    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to tell me your name';
        Subtitle(this, "你只需要說你的名字", function(_this){
            _this.emit(':ask', message, message);
        });
    },
    'Unhandled': function() {
        Subtitle(this, "你只需要說你的名字", function(_this){
            _this.emit(':ask', 'You just only need to tell me your name','');
        });
    }
});


var startGameHandlers = Alexa.CreateStateHandler(states.NAMEMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'NameIntent': function() {
        this.handler.state = states.QUESTION1MODE;//change to states
        this.attributes["name"] = this.event.request.intent.slots.name.value;
        Subtitle(this, this.attributes["name"]+ "你有冇發燒?", function(_this){
            _this.emit(':ask', 'Ok '+_this.attributes["name"]+' Do you have fever ','');//q1
        });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },

    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to say Yes or No';
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', message, message);
        });
    },
    'Unhandled': function() {
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', 'You just only need to say Yes or No','');
        });
    }
});

var question1ModeHandlers = Alexa.CreateStateHandler(states.QUESTION1MODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = states.TEMPERATUREMODE;//change to states
        Subtitle(this, "請根據動畫指示使用溫度計測量體溫,測量後請告訴我", function(_this){
            _this.emit(':ask', 'Please follow the animated instruction to use the thermometer to check your body temperature, please tell me when you are ready.  ','');
        });
    },
    'AMAZON.NoIntent': function() {
        this.handler.state = states.QUESTION2MODE;
        this.attributes['q1'] = 'Question one, you said you do not have fever, ';
        this.attributes['q1answer'] = 0 ;
        this.attributes['hypothemia'] = 0 ;
        Subtitle(this, "你有冇咽喉痛?", function(_this){
            _this.emit(':ask', 'OK, Do you have sore throat','');//Q2
        });
    },
    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to say Yes or No';
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', message, message);
        });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },
    'Unhandled': function() {
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', 'You just only need to say Yes or No','');
        });
    }
});

var temperatureModeHandlers = Alexa.CreateStateHandler(states.TEMPERATUREMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'ReadyIntent': function() {
        this.handler.state = states.QUESTION2MODE;//change to states

        var _this = this;

        var opts = {
            method: 'GET',
            url: 'https://s3-ap-southeast-1.amazonaws.com/iveawsiot/newdata.json',
            json: true
        }

        get.concat(opts, function (err, res, data) {
              if (err) throw err
              console.log("HTTP Request Result: "+res.statusCode) // 200

              if(data["dataType"] == "thermometer_data"){
                _this.attributes['bodyTemperature'] = data["temperature"];

                if(_this.attributes['bodyTemperature'] < 28){
                  _this.attributes['q1'] = 'Question one, you do not have fever., ';
                  _this.attributes['q1answer'] = 0 ;
                  _this.attributes['hypothemia'] = 1 ;
                  Subtitle(_this, "我收到你的體溫資料,你沒有發燒,但有低溫症。請問你有冇咽喉痛?", function(_this){
                      _this.emit(':ask', 'OK your body temperature is '+_this.attributes['bodyTemperature']+', you do not have fever but you have hypothemia, Do you have sore throat','');//Q2
                  });
                }else if(_this.attributes['bodyTemperature'] < 37.8){
                  _this.attributes['q1'] = 'Question one, you do not have fever ';
                  _this.attributes['q1answer'] = 0 ;
                  _this.attributes['hypothemia'] = 0 ;
                  Subtitle(_this, "我收到你的體溫資料,你沒有發燒。請問你有冇咽喉痛?", function(_this){
                      _this.emit(':ask', 'OK your body temperature is '+_this.attributes['bodyTemperature']+', you do not have fever, Do you have sore throat','');//Q2
                  });
                }else{
                  _this.attributes['q1'] = 'Question one, you have fever, ';
                  _this.attributes['q1answer'] = 1 ;
                  _this.attributes['hypothemia'] = 0 ;
                  Subtitle(_this, "我收到你的體溫資料,你有發燒。請問你有冇咽喉痛?", function(_this){
                      _this.emit(':ask', 'OK your body temperature is '+_this.attributes['bodyTemperature']+', you do not have fever, Do you have sore throat','');//Q2
                  });
                }
            }else{
              Subtitle(_this, "我無法收到你的體溫資料,請根據動畫指示再次使用溫度計測量體溫,測量後請告訴我", function(_this){
                  _this.emit(':ask', 'I was unable to receive your body temperature data,Please follow the animated instruction to use the thermometer to check your body temperature again, please tell me when you are ready.  ','');
              });
            }
        });
    },
    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to say Yes or No.';
        Subtitle(this, "現在請使用溫度計測量體溫,測量後請告訴我", function(_this){
            _this.emit(':ask', 'Please use the thermometer to check your body temperature, please tell me when you are ready. ','');
        });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },
    'Unhandled': function() {
      Subtitle(this, "現在請使用溫度計測量體溫,測量後請告訴我", function(_this){
          _this.emit(':ask', 'Please use the thermometer to check your body temperature, please tell me when you are ready. ','');
      });
    }
});

var question2ModeHandlers = Alexa.CreateStateHandler(states.QUESTION2MODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = states.QUESTION3MODE;//change to states
        this.attributes['q2answer'] = 1 ;
        this.attributes['q2'] = 'Question two, you said you have sore throat ';
        Subtitle(this, "你有冇頭痛?", function(_this){
            _this.emit(':ask', 'OK, Do you feeling headache.',''); //Q3
        });
    },
    'AMAZON.NoIntent': function() {
        this.handler.state = states.QUESTION3MODE;
        this.attributes['q2answer'] = 0 ;
        this.attributes['q2'] = 'Question two, you said you do not have sore throat, ';
        Subtitle(this, "你有冇頭痛?", function(_this){
            _this.emit(':ask', 'OK, Do you feeling headache',''); //Q3
        });
    },
    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to say Yes or No';
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', message, message);
        });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },
    'Unhandled': function() {
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', 'You just only need to say Yes or No','');
        });
    }
});

var question3ModeHandlers = Alexa.CreateStateHandler(states.QUESTION3MODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = states.QUESTION4MODE;//change to states
        this.attributes['q3answer'] = 1 ;
        this.attributes['q3'] = 'Question three, you said you feeling headache, ';
        Subtitle(this, "你有冇腹瀉?", function(_this){
            _this.emit(':ask', 'OK, Have you diarrhea.',''); //Q4
        });
    },
    'AMAZON.NoIntent': function() {
        this.handler.state = states.QUESTION4MODE;
        this.attributes['q3'] = 'Question three, you said you not feeling headache, ';
        this.attributes['q3answer'] = 0 ;
        Subtitle(this, "你有冇腹瀉?", function(_this){
            _this.emit(':ask', 'OK, Have you diarrhea.',''); //Q4
        });
    },
    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to say Yes or No.';
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', message, message);
        });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },
    'Unhandled': function() {
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', 'You just only need to say Yes or No','');
        });
    }
});

var question4ModeHandlers = Alexa.CreateStateHandler(states.QUESTION4MODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = states.QUESTION5MODE;//change to states
        this.attributes['q4'] = 'Question four, you said you diarrhea, ';
        this.attributes['q4answer'] = 1 ;
        Subtitle(this, "你有冇頭暈?", function(_this){
            _this.emit(':ask', 'OK, Do you feel dizzy.',''); //Q5
        });

    },
    'AMAZON.NoIntent': function() {
        this.handler.state = states.QUESTION5MODE;
        this.attributes['q4'] = 'Question four, you said you not diarrhea, ';
        this.attributes['q4answer'] = 0 ;
        Subtitle(this, "你有冇頭暈?", function(_this){
            _this.emit(':ask', 'OK, Do you feel dizzy.',''); //Q5
        });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },
    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to say Yes or No';
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', message, message);
        });
    },
    'Unhandled': function() {
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', 'You just only need to say Yes or No','');
        });
    }
});




var question5ModeHandlers = Alexa.CreateStateHandler(states.QUESTION5MODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = states.GLUCOMETERMODE;//change to states
        Subtitle(this, "請根據動畫指示使用血糖機測量血糖,測量後請告訴我", function(_this){
            _this.emit(':ask', 'Please follow the animated instruction to use the glucometer to check your body glucose,please tell me when you are ready. ','');
        });
    },
    'AMAZON.NoIntent': function() {
        this.handler.state = states.QUESTION6MODE;
        this.attributes['q5'] = 'Question five, you said you do not feel dizzy,';
        this.attributes['q5answer'] = 0 ;
        Subtitle(this, "你有冇流鼻涕?", function(_this){
            _this.emit(':ask', 'OK, Do you have running nose.','');//Q6
        });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },
    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to say Yes or No.';
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', message, message);
        });
    },
    'Unhandled': function() {
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', 'You just only need to say Yes or No','');
        });
    }
});



var glucometerModeHandlers = Alexa.CreateStateHandler(states.GLUCOMETERMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'ReadyIntent': function() {
        this.handler.state = states.QUESTION6MODE;//change to states

        var _this = this;

        var opts = {
            method: 'GET',
            url: 'https://s3-ap-southeast-1.amazonaws.com/iveawsiot/newdata.json',
            json: true
        }

        get.concat(opts, function (err, res, data) {
            if (err) throw err
            console.log("HTTP Request Result: "+res.statusCode) // 200

            if(data["dataType"] == "bgmeter_data"){
              _this.attributes['bodyGlucose'] = data["glucose_data"];

              if(_this.attributes['bodyGlucose'] > 120){
                _this.attributes['q5'] = 'Question five, you said you feel dizzy,';
                _this.attributes['q5answer'] = 1 ;
                _this.attributes['hypoglycemia'] = 0;
                _this.attributes['hyperglycemia'] = 1;
                Subtitle(_this, "我收到你的血糖資料,你有高血糖。請問你有冇流鼻涕?", function(_this){
                    _this.emit(':ask', 'OK I had received your body glucose data, your body glucose level is high , Do you have running nose','');
                });
              }else if(_this.attributes['bodyGlucose'] < 50){
                _this.attributes['q5'] = 'Question five, you said you feel dizzy,';
                _this.attributes['q5answer'] = 1 ;
                _this.attributes['hypoglycemia'] = 1;
                _this.attributes['hyperglycemia'] = 0;
                Subtitle(_this, "我收到你的血糖資料,你有低血糖。請問你有冇流鼻涕?", function(_this){
                    _this.emit(':ask', 'OK I had received your body glucose data, your body glucose level is low , Do you have running nose','');
                });
              }else{
                _this.attributes['q5'] = 'Question five, you said you feel dizzy,';
                _this.attributes['q5answer'] = 1 ;
                _this.attributes['hypoglycemia'] = 0;
                _this.attributes['hyperglycemia'] = 0;
                Subtitle(_this, "我收到你的血糖資料,你血糖正常。請問你有冇流鼻涕?", function(_this){
                    _this.emit(':ask', 'OK I had received your body glucose data, your body glucose level is normal , Do you have running nose','');
               });
              }
            }else{
              Subtitle(_this, "請根據動畫指示使用血糖機測量血糖,測量後請告訴我", function(_this){
                  _this.emit(':ask', 'Please follow the animated instruction to use the glucometer to check your body glucose,please tell me when you are ready. ','');
              });
            }
        });
    },
    'AMAZON.HelpIntent': function() {
      Subtitle(this, "請根據動畫指示使用血糖機測量血糖,測量後請告訴我", function(_this){
          _this.emit(':ask', 'Please follow the animated instruction to use the glucometer to check your body glucose,please tell me when you are ready. ','');
      });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },
    'Unhandled': function() {
      Subtitle(this, "請根據動畫指示使用血糖機測量血糖,測量後請告訴我", function(_this){
          _this.emit(':ask', 'Please follow the animated instruction to use the glucometer to check your body glucose,please tell me when you are ready. ','');
      });
    }
});

var question6ModeHandlers = Alexa.CreateStateHandler(states.QUESTION6MODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = states.FINISHMODE;//change to states
        this.attributes['q6'] = 'Question six, you said you have running nose.';
        this.attributes['q6answer'] = 1 ;
        Subtitle(this, "訪問已經完成,請檢查答案是否正確,你表示", subtitleTrueFalse(this.attributes['q1answer']),"發燒,",subtitleTrueFalse(this.attributes['q2answer']),"咽喉痛,",subtitleTrueFalse(this.attributes['q3answer']),"頭痛,",
        subtitleTrueFalse(this.attributes['q4answer']),"腹瀉,",subtitleTrueFalse(this.attributes['q5answer']),"頭暈及", subtitleTrueFalse(this.attributes['q6answer']),"流鼻涕,以上答案是否錯誤?", function(_this){
            _this.emit(':ask', 'The task has been finished, Please check the question answer'+_this.attributes['q1']+_this.attributes['q2']+_this.attributes['q3']+_this.attributes['q4']+_this.attributes['q5']+_this.attributes['q6']+'Is there anything wrong with the answer','');
        });
    },
    'AMAZON.NoIntent': function() {
        this.handler.state = states.FINISHMODE;
        this.attributes['q6'] = 'Question six, you said you do not have running nose.';
        this.attributes['q6answer'] = 0 ;
        Subtitle(this, "訪問已經完成,請檢查答案是否正確,你表示", subtitleTrueFalse(this.attributes['q1answer']),"發燒,",subtitleTrueFalse(this.attributes['q2answer']),"咽喉痛,",subtitleTrueFalse(this.attributes['q3answer']),"頭痛,",
        subtitleTrueFalse(this.attributes['q4answer']),"腹瀉,",subtitleTrueFalse(this.attributes['q5answer']),"頭暈及", subtitleTrueFalse(this.attributes['q6answer']),"流鼻涕,以上答案是否錯誤?", function(_this){
            _this.emit(':ask', 'The task has been finished, Please check the question answer, '+_this.attributes['q1']+_this.attributes['q2']+_this.attributes['q3']+_this.attributes['q4']+_this.attributes['q5']+_this.attributes['q6']+' Is there anything wrong with the answer ','');
        });
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },
    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to say Yes or No.';
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', message, message);
        });
    },
    'Unhandled': function() {
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', 'You just only need to say Yes or No','');
        });
    }
});

var finishmodeHandlers = Alexa.CreateStateHandler(states.FINISHMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = states.QUESTION1MODE;//change to states
        Subtitle(this, "我回到第1題,你有冇發燒?", function(_this){
            _this.emit(':ask', 'We go back to the question one, Do you have epilepsy.','');
        });
    },
    'AMAZON.NoIntent': function() {

        if (this.attributes['q1answer'] === 1 && this.attributes['q2answer'] === 1 && this.attributes['q3answer'] === 1 && this.attributes['q4answer'] === 0 && this.attributes['q5answer'] === 0 && this.attributes['q6answer'] === 1) {
            this.attributes['result'] = "COLD";
        } else if (this.attributes['q1answer'] === 0 && this.attributes['q2answer'] === 1 && this.attributes['q3answer'] === 1 && this.attributes['q4answer'] === 0 && this.attributes['q5answer'] === 0 && this.attributes['q6answer'] === 1) {
            this.attributes['result'] = "COMMON_COLD";
        } else if (this.attributes['q1answer'] === 0 && this.attributes['q2answer'] === 1 && this.attributes['q3answer'] === 0 && this.attributes['q4answer'] === 0 && this.attributes['q5answer'] === 0 && this.attributes['q6answer'] === 0 ) {
            this.attributes['result'] = "COLD";
        } else if (this.attributes['q1answer'] === 0 && this.attributes['q2answer'] === 0 && this.attributes['q3answer'] === 0 && this.attributes['q4answer'] === 1 && this.attributes['q5answer'] === 0 && this.attributes['q6answer'] === 0) {
            this.attributes['result'] = "GASTROENTERITES";
        } else if (this.attributes['q1answer'] === 0 && this.attributes['q2answer'] === 0 && this.attributes['q3answer'] === 0 && this.attributes['q4answer'] === 0 && this.attributes['q5answer'] === 0 && this.attributes['q6answer'] === 1) {
            this.attributes['result'] = "ALLERGIC_RHINITIS";
        } else if (this.attributes['q1answer'] === 1 && this.attributes['q2answer'] === 0 && this.attributes['q3answer'] === 0 && this.attributes['q4answer'] === 0 && this.attributes['q5answer'] === 0 && this.attributes['q6answer'] === 0) {
            this.attributes['result'] = "FATIGUE";
        } else if (this.attributes['hypothemia'] === 1) {
            this.attributes['result'] = "HYPOTHEMIA";
        } else if (this.attributes['hypoglycemia'] === 1) {
              this.attributes['result'] = "HYPOGLYCEMIA";
        } else if (this.attributes['hyperglycemia'] === 1) {
              this.attributes['result'] = "HYPERGIYCEMIA";
        } else {
            this.attributes['result'] = "UNKNOWN";
        }

        DynamoDB.table('Nurse') // TODO Change DB Name
        .insert({
            createDT: Date.now(),
            name: this.attributes["name"],
            haveFever: this.attributes['q1answer'],
            haveSoreThroat: this.attributes['q2answer'],
            haveHeadache: this.attributes['q3answer'],
            haveDiarrhea: this.attributes['q4answer'],
            haveDizzy: this.attributes['q5answer'],
            haveRunningNose: this.attributes['q6answer'],
            haveHypothemia: this.attributes['hypothemia'],
            haveLowGlucose: this.attributes['hypoglycemia'],
            haveHighGlucose: this.attributes['hyperglycemia'],
            bloodSugar: this.attributes['bodyGlucose'],
            bodyTemperature:this.attributes['bodyTemperature'],
            result: this.attributes['result']
        }, function(err, data){
            console.log(data);
            callback(err, data);
        });

        var _this = this;
        var callback = function(err, data){
            if(err){
                console.error(err);
            }else{
                if (_this.attributes['result'] == "COLD") {
                    Subtitle(_this, "你可能患有普通感冒", function(_this){
                        _this.emit(':tell', 'You may have cold.');
                    });
                } else if (_this.attributes['result'] == "COMMON_COLD") {
                    Subtitle(_this, "你可能患有流感", function(_this){
                        _this.emit(':tell', 'You may have common cold.');
                    });
                } else if (_this.attributes['result'] == "GASTRITIS") {
                    Subtitle(_this, "你可能患有胃炎", function(_this){
                        _this.emit(':tell', 'You may have gastritis.');
                    });
                } else if (_this.attributes['result'] == "GASTROENTERITES") {
                    Subtitle(_this, "你可能患有腸胃炎", function(_this){
                        _this.emit(':tell', 'You may have gastroenteritis.');
                    });
                } else if (_this.attributes['result'] == "ALLERGIC_RHINITIS") {
                    Subtitle(_this, "你可能患有過敏性鼻炎", function(_this){
                        _this.emit(':tell', 'You may have allergic rhinitis.');
                    });
                } else if (_this.attributes['result'] == "FATIGUE") {
                    Subtitle(_this, "你可能有疲勞問題", function(_this){
                        _this.emit(':tell', 'You may have fatigue problem.');
                    });
                } else if (_this.attributes['result'] == "LOWHYPOGLYCEMIA") {
                      Subtitle(_this, "你可能有低血赯問題", function(_this){
                          _this.emit(':tell', 'You may have hypoglycemia problem.');
                    });
                } else if (_this.attributes['result'] == "hyperglycemia") {
                        Subtitle(_this, "你可能有高血赯問題", function(_this){
                            _this.emit(':tell', 'You may have High blood sugar problem.');
                    });
                } else if (_this.attributes['result'] == "HYPOTHEMIA") {
                        Subtitle(_this, "你可能有低温症問題", function(_this){
                            _this.emit(':tell', 'You may have hypothemia problem.');
                      });
                } else {
                    Subtitle(_this, "我不肯定你的身體情況,你需要到診所或醫院作深入檢查", function(_this){
                        _this.emit(':tell', 'I not sure your problem of the body,you need to go to the hospital or clinic to do a deep check.');
                    });
                }
            }
        }
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':saveState', true);
    },
    'AMAZON.HelpIntent': function() {
        var message = 'You just only need to say Yes or No.';
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', message, message);
        });
    },
    'Unhandled': function() {
        var message = 'You just only need to say Yes or No.';
        Subtitle(this, "你只需要說yes或者no", function(_this){
            _this.emit(':ask', message, message);
        });
    }
});
