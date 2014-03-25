Farmdat::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = true

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Logger setup for use with Unicorn
  config.logger = Logger.new(STDOUT)
  config.logger.level = Logger.const_get(ENV['LOG_LEVEL'] ? ENV['LOG_LEVEL'].upcase : 'INFO')

  # Using mailgun
  config.action_mailer.smtp_settings = {
    :address              => "smtp.mailgun.org",
    :port                 => 587,
    :domain               => 'aptos.mailgun.org',
    :user_name            => 'postmaster@aptos.mailgun.org',
    :user_name            => ENV['MAILGUN_SMTP_LOGIN'],
    :password             => ENV['MAILGUN_SMTP_PASSWORD'],
    :enable_starttls_auto => true
  }

  config.notifications = {
    :from => "bswilkerson@gmail.com",
    :url => "http://localhost:5000",
    :mailto_info => "bswilkerson@gmail.com"
  }
end
