#https://console.developers.google.com/apis/credentials/oauthclient/133830027138-r2e8b8t5q7va4mberofg51h0f5inqvfp.apps.googleusercontent.com?project=aptoscreative
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, ENV["GOOGLE_KEY"], ENV["GOOGLE_SECRET"], {name: "google_login", approval_prompt: ''}
end

OmniAuth.config.on_failure = Proc.new { |env|
  OmniAuth::FailureEndpoint.new(env).redirect_to_failure
}