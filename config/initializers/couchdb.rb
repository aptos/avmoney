require 'couchrest/model'
CouchServer = CouchRest::Server.new # defaults to localhost:5984
# CouchServer.default_database = "appname-#{Rails.env}"

class CouchRest::Model::Designs::View

  def as_hash key
    keyed_view = Hash.new
    self.rows.map{|r| keyed_view[r['value'][key]] = r['value']}
    keyed_view
  end

  def values
    self.rows.map{|r| r['value'] }
  end
end