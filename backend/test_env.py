from decouple import config

print(config('TWILIO_ACCOUNT_SID'))
print(config('TWILIO_AUTH_TOKEN'))
