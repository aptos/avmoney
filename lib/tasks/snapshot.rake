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

  desc "change project"
  task :change_project => :environment do
    client = "PG & E Facilities Management Office"
    from_project = "Reprographics - Project Management"
    to_project = "Reprographics - Project Management - 3"
    cap = 7000

    client_id = Client.by_name.key(client).first.id

    total = 0
    activities = Activity.by_client_id.key(client_id).all
    activities.sort_by{|a| a.created_at}.each do |activity|
      if activity.project == from_project
        expense = (activity.hours) ? activity.hours * activity.rate : activity.expense
        total += expense
        break if total > cap
        puts "#{activity.created_at} #{activity.status} #{total} : #{expense} - #{activity.notes}"
        activity.update_attributes(project: to_project)
      end
    end

  end

end
