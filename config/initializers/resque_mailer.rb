class AsyncMailer < ActionMailer::Base
  include Resque::Mailer
end

Resque::Mailer.excluded_environments = [:test]