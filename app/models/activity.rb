class Activity < CouchRest::Model::Base
  property :_id, String
  property :client_id, String
  property :client_name, String
  property :project, String
  property :notes, String
  property :date, Date
  property :hours, Integer
  property :status, String, default: "Open"

  timestamps!

  design do
    view :by_date
    view :by_status
  end

end