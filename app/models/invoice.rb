class Invoice < CouchRest::Model::Base
  property :_id, String
  property :name, String
  property :invoice_id, Integer
  property :client_data, Hash
  property :hours_sum, Float
  property :hours_amount, String
  property :invoice_total, String
  property :activities, Array
  property :project, String
  property :invoice_count, Integer, default: 0
  property :status, String, default: 'Open'

  timestamps!

  design do
    view :by_name
  end

end