class Client < CouchRest::Model::Base
  property :_id, String
  property :name, String
  property :rate, Float
  property :tax_rate, Float
  property :address, String
  property :deliveries, String
  property :contact, String
  property :email, String
  property :phone, String
  property :cell, String
  property :contact2, String
  property :email2, String
  property :phone2, String
  property :cell2, String
  property :projects, [String]
  property :archived_projects, [String]
  property :invoice_count, Integer, default: 0
  property :archived, TrueClass, default: false
  timestamps!

  design do
    view :by_name
  end

end