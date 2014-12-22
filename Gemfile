source 'https://rubygems.org'

ruby "2.0.0"

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.1.6'

gem 'foreman'
# server
gem 'unicorn'

# authentication
gem 'omniauth'
gem 'omniauth-google-oauth2'

# Abort requests that are taking too long; a Rack::Timeout::Error will be raised.
# unicorn or other thread-safe server must be used.
gem "rack-timeout"

# cache
gem 'rack-cache'
gem 'dalli'
gem 'memcachier'

# db is couch
gem 'couchrest_model', '2.0.1'

# static config file support
gem 'global'

# javascript assets
gem 'underscore-rails'
gem 'jquery-rails'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.0'
gem 'quiet_assets', :group => :development

# icon fonts
gem "font-awesome-rails", '~> 4.1'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'


# Storage on S3
gem 'aws-sdk', '~> 1.0'

# Application exception handler, works for both rails and javascript errors
gem 'rollbar', '~> 0.12.17'

# PDF print support
gem 'wisepdf'
gem 'wkhtmltopdf-binary'

group :test, :development do
	gem "rspec-rails", "~> 2.8"
	gem "factory_girl_rails", "~> 4.0"
	gem 'dotenv-rails'
  gem 'pry'
  gem 'pry-byebug'
end