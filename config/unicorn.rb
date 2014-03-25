# config/unicorn.rb
worker_processes Integer(ENV["WEB_CONCURRENCY"] || 3)
timeout 15
preload_app true

before_fork do |server, worker|
  # If you are using Redis but not Resque, change this
  if defined?(Resque)
    Resque.redis.quit
    Rails.logger.info('Disconnected from Redis')
  end

  sleep 1
end

after_fork do |server, worker|
  # If you are using Redis but not Resque, change this
  if defined?(Resque)
    # Resque.redis = ENV['REDIS_URI']
    rails_root = Rails.root || File.dirname(__FILE__) + '/..'
    rails_env = Rails.env || 'development'
    resque_config = YAML.load_file(rails_root.to_s + '/config/resque.yml')
    Resque.redis = resque_config[rails_env] 
    Rails.logger.info('Connected to Redis')
  end
end