-- Cap OTP verification attempts per code (5 wrong guesses invalidates it).
alter table otp_codes
  add column if not exists attempts integer not null default 0;
