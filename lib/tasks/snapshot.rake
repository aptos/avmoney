require 'restclient'
require 'json'
require 'couchrest'
require 'couchrest_model'
# require 'pry'

@timestamp = Time.now.strftime('%Y%m%d')

namespace :db do

  desc "backup database"
  task :snapshot do
    log = File.open('snapshot.log', 'w+')
    log.puts @timestamp
    db = "avmoney_production"

    config = {
      source: "https://#{ENV['COUCH_USER']}:#{ENV['COUCH_PASSWORD']}@#{ENV['COUCH_USER']}.cloudant.com/#{db}",
      target: "#{db}-#{@timestamp}",
      create_target: true,
      continuous: false
    }
    puts db
    resp = RestClient.post "http://admin:admin@localhost:5984/_replicate", config.to_json, :content_type => :json
    log.puts "#{db}\n#{resp}\n\n"
    status = JSON resp
    raise "FAIL!" unless status['ok']
    puts "OK: #{status['ok']}"
  end

end
