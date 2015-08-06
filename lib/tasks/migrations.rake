require 'restclient'
require 'json'
require 'couchrest'
require 'couchrest_model'
# require 'pry'

@timestamp = Time.now.strftime('%Y%m%d')

namespace :db do

  desc "update_work_orders from invoices"
  task :update_work_orders => :environment do
    client = "PG & E Facilities Management Office"
    client_id = Client.by_name.key(client).first.id

    invoices = Invoice.by_client.key(client_id).values
    invoices.each do |invoice|
      if invoice['work_order'] && invoice['project']
        if project = Project.by_client_id_and_name.startkey([client_id, invoice['project']]).endkey([client_id, invoice['project']]).first
          project.update_attributes(wo_number: invoice['work_order'])
        end
      end
    end
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
