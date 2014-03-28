class Invoice < CouchRest::Model::Base
  property :_id, String
  property :invoice_number, Integer
  property :client_id, String
  property :name, String
  property :client_data, Hash
  property :hours_sum, Float
  property :hours_amount, Float
  property :expenses, Float
  property :tax, Float
  property :invoice_total, Float
  property :activities, Array
  property :project, String
  property :invoice_count, Integer, default: 0
  property :status, String, default: 'Open'
  property :paid_date, Date
  property :paid, Float

  timestamps!

  design do
    view :by_name
    view :by_client_id
  end

end