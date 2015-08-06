class Project < CouchRest::Model::Base
  property :_id, String
  property :client_id, String
  property :name, String
  property :wo_number, String
  property :po_number, String
  property :cap, Integer

  timestamps!

  design do
    view :by_client_id
    view :by_client_id_and_name
  end

end
