require 'restclient'
require 'json'
require 'couchrest'
require 'couchrest_model'
require 'pry'

@remotes = [
  'avmoney_production',
]

@timestamp = Time.now.strftime('%Y%m%d')
@db = CouchRest.database("http://admin:admin@localhost:5984/avmoney_production-20140815")

def save_designs
  settings_all = {
    "_id" => "_design/Activities",
    :views => {
      :dump => {
        :map => "function(doc) { if (doc.type == 'Activity') {
        emit(doc._id, [doc.date, doc.client_name, doc.project, doc.hours, doc.status, doc.project, doc.invoice_id]);
        } };"
      }
    }
  }
  save_or_create(settings_all)
end

def save_or_create(doc)
  begin
    rev = @db.get(doc['_id'])['_rev']
    doc['_rev'] = rev
    doc = @db.save_doc(doc)
  rescue
    doc = @db.save_doc(doc)
  end
end

class Array
  def to_csv
    csv = String.new
    if self[0].is_a?(Array)
      self.each do |r|
        str = r.inspect
        str[0] = ''
        str.chop!
        csv += str + "\n"
      end
    else
      csv = self.inspect
      csv[0] = ''
      csv.chop!
    end
    return csv
  end
end

desc "backup database"
task :snapshot do
  log = File.open('snapshot.log', 'w+')
  log.puts @timestamp

  @remotes.each do |db|
    config = {
      source: "https://#{ENV['DBCREDENTIALS']}@aptos.cloudant.com/#{db}",
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

desc "activity dump"
task :dump do
  save_designs
  dump = File.open("activity_dump.#{@timestamp}.csv", 'w+')
  invoices_map = {}
  invoices = []
  @db.view('Invoice/by_client', include_docs: false){ |r|
    invoices.push r['value'].values
    invoices_map[r['id']] = r['value']['invoice_number']
  }

  dump.puts invoices.to_csv
  dump.puts "*" * 64

  @db.view('Activities/dump', include_docs: false)['rows'].each do |activity|
    if activity['value'][4] != 'Active'
      invoice_number = invoices_map[activity['value'].last]
      activity['value'].push invoice_number
    end
    dump.puts activity['value'].to_csv
  end
end

