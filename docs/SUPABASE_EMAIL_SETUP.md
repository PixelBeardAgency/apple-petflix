# Supabase Email Configuration for Security

## Overview
To prevent user enumeration attacks, we've configured the registration flow to always show success on the frontend, regardless of whether the email already exists. Supabase handles sending appropriate emails automatically.

## Email Templates to Configure

### 1. Confirm Signup Email
This is sent when a new user registers with a unique email.

**To configure in Supabase Dashboard:**
1. Go to **Authentication** → **Email Templates** → **Confirm signup**
2. Update the template:

```html
<h2>Welcome to Petflix! 🐾</h2>
<p>Thanks for signing up! Click the link below to confirm your email address and activate your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't create this account, you can safely ignore this email.</p>
<p>Happy watching!</p>
<p>— The Petflix Team</p>
```

### 2. Email Change Email (Used for Existing User Notification)
When someone tries to register with an existing email, Supabase sends the "email change" notification. We can customize this to be more helpful.

**To configure in Supabase Dashboard:**
1. Go to **Authentication** → **Email Templates** → **Change Email Address** 
2. Update the template to be friendly for existing users:

```html
<h2>Someone tried to create an account with your email</h2>
<p>Hi there,</p>
<p>We received a request to create a new Petflix account using this email address (<strong>{{ .Email }}</strong>).</p>
<p>However, you already have an account with us! Here's what you can do:</p>
<ul>
  <li><strong>Want to sign in?</strong> <a href="{{ .SiteURL }}/login">Click here to log in</a></li>
  <li><strong>Forgot your password?</strong> <a href="{{ .SiteURL }}/forgot-password">Reset it here</a></li>
</ul>
<p>If you didn't make this request, you can safely ignore this email. Your account is secure.</p>
<p>— The Petflix Team</p>
```

### 3. Additional Settings

**In Authentication Settings:**
1. Go to **Authentication** → **Settings** → **Auth Providers** → **Email**
2. Ensure **Enable email confirmations** is **ON**
3. Set **Secure email change** to **enabled**

## How It Works

### New User Flow:
1. User enters email/username/password on registration page
2. Frontend always shows "Check your email" message
3. Supabase creates account and sends confirmation email
4. User clicks link and account is activated

### Existing User Flow:
1. User enters existing email on registration page  
2. Frontend still shows "Check your email" message (preventing enumeration)
3. Supabase detects existing email and sends notification email
4. Existing user receives email with login/reset password links
5. No new account is created

## Security Benefits

✅ **Prevents User Enumeration**: Attackers can't determine which emails are registered
✅ **User-Friendly**: Existing users get helpful instructions  
✅ **No False Accounts**: Duplicate accounts aren't created
✅ **Maintains Privacy**: Registration status isn't leaked

## Testing

### Test New User:
1. Use a new email address
2. Fill in registration form
3. Check email for confirmation link
4. Confirm email and log in

### Test Existing User:
1. Use an existing account's email
2. Fill in registration form
3. Check email - should receive "already have account" email
4. Follow login link to sign in

## Notes

- Supabase handles all email logic automatically
- The frontend never reveals if an account exists
- Both flows appear identical to the end user initially
- Email templates can be further customized with your branding

