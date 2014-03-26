class Client < CouchRest::Model::Base
  property :_id, String
  property :name, String
  property :rate, Integer
  property :tax_rate, Float
  property :address, String
  property :contact, String
  property :email, String
  property :projects, [String]

  timestamps!

  design do
    view :by_name
  end

end