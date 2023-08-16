const admin = require('firebase-admin');

const serviceAccount = {
    "type": "service_account",
    "project_id": "aerobic-bonus-393306",
    "private_key_id": "2cab75eaa202146fa14be5517a77b0e79b32e6d4",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDVljBxnDosSZDf\nUfyvC9w9aTEO4o4WYeMkR2CA3Rzhxg2lAu7v34pjh8ZB2QuK91XigfW/CvStaW6A\nub8/7dkgCgUqh7UNccv6AFHq++rPUtnA7ZJi29AvlgCl+vz07Uzx/3mWN3+wbW2P\nVkObnayXWHWoLkISoOYeuiN+MDGzDsVu6lFxGK5Q89FmUltmGVpFrQeOPOILIRFz\nwlpNkKBx30ucJhB7SWi2YyhTNSMlA3/bu/HYLi8UpWAFUUfVCrh1yGfUkBI1kmU+\nKTmlJv8aR6yibvFDbhAtLl98OCgsesCilZnaASrP0NvTAlBUID4LVh5DNwBFwUn5\nvoqECnyLAgMBAAECggEAVwcAyzH0dBovmQcPlgWXokAr2JxQd+c/xYb919QAkjAA\nXEWTNRMZENAAZNE6xk9cY9Q/XS3qH4SPnYzR1Asmhsr+auNrzsQY8E9UEZK/DOX9\nywIiPPzC2bjdn8PicSwFx68ojCAl+63Cz/4+wvgenHZTTok2q996lHeUwbSCc6np\nEL6cxUGn8ARcdPiz2RQ+G107mryEpaYOFwQAzyAbdFmPk403UFPf2z7pR09JPo0Z\nURUrTbeyteBC72MAbPINyl5XAyrUy83FMgsmwLbOxFnvm4qGpy/4J9s4MYuHK30k\nCvbZQN0QldV5+MYAZdYWh/n969m6r5dZUiUdiCmPFQKBgQDsAJ4YdIMfueFv1/xd\naWKcaGVgp750S3eHMmU4p4rYDFOzpugy+krgTRu9FigYJAqatpsR5hDMTc2+FqB7\n9VoNjaeUwK9VYoZtZ8nJlWxDQ0sdUeQtwrVTu8pjRONm95uOHf0kBHaiyiDVE1zR\n85NmHbtEj2SNf5dEr6lL5ShbVQKBgQDnr1PrrifYIh69GMWfQL7STp7xyaG6b7Tu\nf6Nztb7kizYlw6RKnXrBnUF9P/gw9tELUVj0IIFN9VfZAIl2tdgXREF2unQ/2Ge1\nZydLess0OBzkPTf5sdkJD92cqFeqwkwrcluXhR1hvQxTIi3uRn0bquUsN5hsk/U8\nn8x+ab44XwKBgAOIWtV44QGXkbVP4VowmqZGtcXFnQc2nfprGbLIZz6mqJYW2IDy\n2C4VWWXyL/V0jKgWNaoF7JhyTbMbuZlBafCr/yct3zIDAIogtJeM4gr7teMhd63r\nrTUsqXHk9RZ0fGKbNk/UtUXoiqdF2+zUnY84wLXdA59OmqAPlRQqwPjlAoGAJguq\nkkc1D876kT7iJPay30I946KixkTVx1x6cOPlhw49RBJOhlo58FVsja7ViOTfCya+\nnsg/s5eYZ3ApIq9V3uw8e8y+jkVxMl7QGxr9B4Q3aluLN5u28kACulkCnG3vqCrN\nU6JuYsByp6wzMq+sl8CGha5Tf3EEkoIDSLcAn60CgYEAvk7SGzEhlJFADp/cDi5I\n8o0GE4QquPPssmPeTJQ/W/hjByUHELNphuOAOsQbrNIBPijIsIbbN7gqoV2y6/WT\nB+ga0DFc5NL5Wa/JyDTWpztlGq3GRRNvM5wloeRZEKT1lUNQsOuGJqEKoqv8vi3T\nTW5at8gh8wkmvegg9Lbt3tk=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-2er7x@aerobic-bonus-393306.iam.gserviceaccount.com",
    "client_id": "116458990549864285103",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-2er7x%40aerobic-bonus-393306.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const token = 'ftmFi0IjT2KtO_bVmZ36Qp:APA91bG21yAVmLqB16ammyPwIjn8jfGYJmHVFwQgC6kXdMfH-az2W0yrUczRCL78KTIHkTCxkfLCUrYO_GoLlxRBQ1rambiAQQZmCBol4E8q-8VS7Ew3NakyxuUrLXaNkhw9S_N1Z4Bt';

const message = {
  token: token,
  notification: {
    title: 'New Update',
    body: 'A new update is available.',
  },
};

admin.messaging().send(message)
  .then(response => {
    console.log('Notification sent successfully:', response);
  })
  .catch(error => {
    console.error('Error sending notification:', error);
  });
