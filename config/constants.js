//setting up keys and their values for development
module.exports = {
	'STATUS': { 'ACCOUNT_ACTIVE':'ACTIVE',   'ACCOUNT_DEACTIVE': 'DEACTIVE'},
	'BOOKING_STATUS': {'STATUS_CANCEL':'CANCEL' , 'STATUS_CONFIRM':'CONFIRM' , 'STATUS_PENDING':'PENDING'},
	'DEFAULT_LANGUAGE': "en",
	'APP_LANGUAGE': ['en', 'hn'],
	'URL_EXPIRE_TIME': '2h',
	'PROGRAM_DEFAULT_STATUS': 'program_remaing',
	'WORKOUT_DEFAULT_STATUS': 'workout_remaing',
	'DRILL_DEFAULT_STATUS': 'drill_remaing',
	'USER_TYPE': {
		'DRIVER': 1,
		'CUSTOMER': 2
	},
	'USER_SKILL': {
		'BEGGINER': 1,
		'INTERMEDIATE': 2,
		'ADVANCED': 3
	},
	'SOCIAL_LOGIN_TYPE': {
		'FACEBOOK': 1,
		'GOOGLE': 2,
		'APPLE': 3
	},
	'PROGRAM_TYPE': {
		'ON_SEASON': 1,
		'OFF_SEASON': 2,
		'ALL_SEASON': 3
	},
	'THEME_TYPE': {
		'WHITE': 1,
		'BLACK': 2	
	},
	'STATUS_CODE': {
		'SUCCESS': '1',
		'FAIL': '0',
		'VALIDATION': '2',
		'UNAUTHENTICATED': '-1',
		'NOT_FOUND': '-2'
	},
	'WEB_STATUS_CODE': {
		'OK': 200,
		'CREATED': 201,
		'NO_CONTENT': 204,
		'BAD_REQUEST': 400,
		'UNAUTHORIZED': 401,
		'NOT_FOUND': 404,
		'SERVER_ERROR': 500
	},
	'VERSION_STATUS': {
		'NO_UPDATE': 0,
		'OPTIONAL_UPDATE': 1,
		'FORCE_UPDATE': 2,
	},
	'EMAIL_TEMPLATE': {
		'WELCOME_MAIL': 'WELCOME_MAIL',
		'PASSWORD_RESET': 'PASSWORD_RESET',
		'RESEND_MAIL': 'RESEND_MAIL',
		'CONFIRM_MAIL': 'CONFIRM_MAIL'
	},
	'ENCRYPT_STRING': {
		'START_SYMBOL': '{!!!{',
		'END_SYMBOL': '}!!!}'
	},
	'NOTIFICATION_READ' : {
		'UNREAD' : 0,
		'READ' : 1,
	},
	'DEVICE_TYPE' : {
		'ANDROID' : 1,
		'IOS' : 2,
	},
	"ANDROID_USERS_TOPIC": "twtmn_android_users",
	"IOS_USERS_TOPIC": "twtmn_ios_users",
	'PATH' : {
		'PROFILE_IMG_PATH' : 'public/images/profilePic',
		'BADGE_IMAGE_PATH' : 'public/images/badgeImage',
		'KIT_IMAGE_PATH' : 'public/images/kitImage',
		'KIT_LOGO_PATH' : 'public/images/kitLogo',
		'NOTIFICATION_IMAGE_PATH' : 'public/images/notificationImage',
		'APK_PATH' : 'public/files/apk',
		'TDS_PATH' : 'public/files/certificate',
		'TRIVIA_IMAGE_PATH' : 'public/files/apk',
		'QUESTION_CSV_PATH' : 'public/files/questionsCsvFiles',
		'SCRIPT_UPLOAD_PATH' : 'public/files/scriptUploadFiles',
		'PUBLIC_CMS_PATH' : 'public/cms',
		'CMS_UPLOAD_PATH' : 'public/cms/upload',
		'CMS_BACKUP_PATH' : 'public/cms/backup'
	},
	'FS_TYPES': {
        'DIR': 'DIR',
        'FILE': 'FILE'
	},
	'LANG': {
		'HINDI': 'hn',
		'ENGLISH': 'en'
	}
}