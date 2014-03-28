class Activity < CouchRest::Model::Base
  property :_id, String
  property :client_id, String
  property :client_name, String
  property :project, String
  property :notes, String
  property :date, Date
  property :hours, Integer
  property :rate, Integer
  property :expense, Float
  property :tax_rate, Float
  property :status, String, default: "Open"
  property :invoice_id, String

  timestamps!

  design do
    view :by_date
    view :by_status
    view :by_invoice_id
  end

end